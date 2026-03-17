import Text "mo:core/Text";
import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  // System state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Post types
  type PostType = { #regular; #story; #hangout };
  type UserId = Principal;
  type PostId = Nat;
  type HangoutId = Nat;
  type MessageId = Nat;
  type GroupId = Nat;

  // Profile data (no gender field - stored separately)
  public type Profile = {
    username : Text;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
    followers : Nat;
    following : Nat;
  };

  // Post data
  public type Post = {
    id : PostId;
    author : UserId;
    postType : PostType;
    content : ?Storage.ExternalBlob;
    caption : Text;
    timestamp : Time.Time;
  };

  // Hangout Post internal data (private)
  type HangoutPost = {
    id : HangoutId;
    author : UserId;
    title : Text;
    description : Text;
    date : Time.Time;
    location : Text;
    maxSpots : Nat;
    approvedAttendees : List.List<UserId>;
  };

  // Hangout Post immutable external view (public)
  public type HangoutPostView = {
    id : HangoutId;
    author : UserId;
    title : Text;
    description : Text;
    date : Time.Time;
    location : Text;
    maxSpots : Nat;
    approvedAttendees : [UserId];
  };

  // Hangout join request data
  public type HangoutRequest = {
    hangoutId : HangoutId;
    userId : UserId;
    timestamp : Time.Time;
  };

  // Message data
  public type Message = {
    id : MessageId;
    sender : UserId;
    recipient : UserId;
    content : Text;
    timestamp : Time.Time;
    status : MessageStatus;
  };
  public type MessageStatus = { #pending; #approved; #declined };

  // Group chat data (internal)
  type GroupChat = {
    id : GroupId;
    name : Text;
    members : Map.Map<UserId, List.List<UserId>>;
    messages : List.List<Message>;
  };

  // Group chat public immutable view
  public type GroupChatView = {
    id : GroupId;
    name : Text;
    memberIds : [UserId];
    messages : [Message];
  };

  module Post {
    public func compareByTimestamp(post1 : Post, post2 : Post) : Order.Order {
      Int.compare(post2.timestamp, post1.timestamp); // Reverse order for most recent first
    };
  };

  module HangoutPost {
    public func compareByDate(hp1 : HangoutPost, hp2 : HangoutPost) : Order.Order {
      Int.compare(hp1.date, hp2.date);
    };

    public func toView(hangout : HangoutPost) : HangoutPostView {
      {
        id = hangout.id;
        author = hangout.author;
        title = hangout.title;
        description = hangout.description;
        date = hangout.date;
        location = hangout.location;
        maxSpots = hangout.maxSpots;
        approvedAttendees = hangout.approvedAttendees.toArray();
      };
    };
  };

  module Message {
    public func compareByTimestamp(msg1 : Message, msg2 : Message) : Order.Order {
      Int.compare(msg2.timestamp, msg1.timestamp);
    };
  };

  module GroupChat {
    public func toView(group : GroupChat) : GroupChatView {
      {
        id = group.id;
        name = group.name;
        memberIds = [];
        messages = group.messages.toArray();
      };
    };
  };

  // Storage
  var nextPostId = 0;
  var nextHangoutId = 0;
  var nextMessageId = 0;
  var nextGroupId = 0;

  let profiles = Map.empty<UserId, Profile>();
  let userGenders = Map.empty<UserId, Text>();
  let followers = Map.empty<UserId, Set.Set<UserId>>();
  let followings = Map.empty<UserId, Set.Set<UserId>>();
  let posts = Map.empty<PostId, Post>();
  let hangoutPosts = Map.empty<HangoutId, HangoutPost>();
  let hangoutRequests = Map.empty<HangoutId, List.List<HangoutRequest>>();
  let userPosts = Map.empty<UserId, List.List<PostId>>();
  let messages = Map.empty<MessageId, Message>();
  let userMessages = Map.empty<UserId, List.List<MessageId>>();
  let groupChats = Map.empty<GroupId, GroupChat>();
  let groupMembers = Map.empty<GroupId, List.List<UserId>>();
  let messageRequests = Map.empty<UserId, List.List<MessageId>>();
  let users = List.empty<UserId>();

  // Helper function to check if two users are mutual followers (friends)
  func areFriends(user1 : UserId, user2 : UserId) : Bool {
    let user1Followers = switch (followers.get(user1)) {
      case (null) { return false };
      case (?set) { set };
    };
    let user2Followers = switch (followers.get(user2)) {
      case (null) { return false };
      case (?set) { set };
    };
    user1Followers.contains(user2) and user2Followers.contains(user1);
  };

  // Profile management
  public query ({ caller }) func getProfile(userId : UserId) : async ?Profile {
    // Public function - anyone can view profiles (including guests)
    profiles.get(userId);
  };

  public query ({ caller }) func getAllUsers() : async [UserId] {
    // Public function - anyone can get list of users for search (including guests)
    users.toArray();
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profiles");
    };
    profiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (profiles.get(caller)) {
      case (?_) {};
      case (null) { users.add(caller) };
    };
    profiles.add(caller, profile);
  };

  // Gender management (separate from profile for stable variable compatibility)
  public shared ({ caller }) func saveCallerGender(gender : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save gender");
    };
    userGenders.add(caller, gender);
  };

  public query ({ caller }) func getCallerGender() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their gender");
    };
    userGenders.get(caller);
  };

  // Follow/Unfollow
  public shared ({ caller }) func followUser(userId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow");
    };

    if (caller == userId) {
      Runtime.trap("Cannot follow yourself");
    };

    switch (profiles.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?_) {
        let currentFollowers = switch (followers.get(userId)) {
          case (null) { Set.empty<UserId>() };
          case (?set) { set };
        };
        currentFollowers.add(caller);

        // Add to followings of the caller
        let currentFollowing = switch (followings.get(caller)) {
          case (null) { Set.empty<UserId>() };
          case (?set) { set };
        };
        currentFollowing.add(userId);

        // Save updated sets
        followers.add(userId, currentFollowers);
        followings.add(caller, currentFollowing);
      };
    };
  };

  public shared ({ caller }) func unfollowUser(userId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow");
    };

    switch (followers.get(userId)) {
      case (null) {};
      case (?followerSet) {
        followerSet.remove(caller);
        followers.add(userId, followerSet);
      };
    };

    switch (followings.get(caller)) {
      case (null) {};
      case (?followingSet) {
        followingSet.remove(userId);
        followings.add(caller, followingSet);
      };
    };
  };

  // Posts
  public shared ({ caller }) func createPost(content : ?Storage.ExternalBlob, caption : Text) : async Post {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let post : Post = {
      id = nextPostId;
      author = caller;
      postType = #regular;
      content;
      caption;
      timestamp = Time.now();
    };

    posts.add(nextPostId, post);

    switch (userPosts.get(caller)) {
      case (null) {
        let newList = List.empty<PostId>();
        newList.add(nextPostId);
        userPosts.add(caller, newList);
      };
      case (?list) {
        list.add(nextPostId);
      };
    };

    nextPostId += 1;
    post;
  };

  public shared ({ caller }) func deletePost(postId : PostId) : async () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?post) {
        // Only the author or admin can delete
        if (post.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the author or admin can delete this post");
        };
        posts.remove(postId);
      };
    };
  };

  // Hangout Posts
  public shared ({ caller }) func createHangout(
    title : Text,
    description : Text,
    date : Time.Time,
    location : Text,
    maxSpots : Nat,
  ) : async HangoutPostView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create hangout posts");
    };

    let hangout : HangoutPost = {
      id = nextHangoutId;
      author = caller;
      title;
      description;
      date;
      location;
      maxSpots;
      approvedAttendees = List.empty<UserId>();
    };

    hangoutPosts.add(nextHangoutId, hangout);
    hangoutRequests.add(nextHangoutId, List.empty<HangoutRequest>());
    nextHangoutId += 1;
    HangoutPost.toView(hangout);
  };

  public shared ({ caller }) func requestJoinHangout(hangoutId : HangoutId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request to join hangouts");
    };

    switch (hangoutPosts.get(hangoutId)) {
      case (null) { Runtime.trap("Hangout does not exist") };
      case (?hangout) {
        // Cannot join your own hangout
        if (hangout.author == caller) {
          Runtime.trap("Cannot join your own hangout");
        };

        // Check if already approved
        let attendeesList = hangout.approvedAttendees.toArray();
        for (attendee in attendeesList.values()) {
          if (attendee == caller) {
            Runtime.trap("Already approved for this hangout");
          };
        };

        // Add to requests
        let requests = switch (hangoutRequests.get(hangoutId)) {
          case (null) { List.empty<HangoutRequest>() };
          case (?list) { list };
        };

        // Check if already requested
        let requestsArray = requests.toArray();
        for (req in requestsArray.values()) {
          if (req.userId == caller) {
            Runtime.trap("Already requested to join this hangout");
          };
        };

        let newRequest : HangoutRequest = {
          hangoutId;
          userId = caller;
          timestamp = Time.now();
        };
        requests.add(newRequest);
        hangoutRequests.add(hangoutId, requests);
      };
    };
  };

  public shared ({ caller }) func approveHangoutRequest(hangoutId : HangoutId, userId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can approve hangout requests");
    };

    switch (hangoutPosts.get(hangoutId)) {
      case (null) { Runtime.trap("Hangout does not exist") };
      case (?hangout) {
        // Only the author can approve
        if (hangout.author != caller) {
          Runtime.trap("Unauthorized: Only the hangout author can approve requests");
        };

        // Check if spots available
        if (hangout.approvedAttendees.size() >= hangout.maxSpots) {
          Runtime.trap("Hangout is full");
        };

        // Check if request exists
        let requests = switch (hangoutRequests.get(hangoutId)) {
          case (null) { Runtime.trap("No requests found") };
          case (?list) { list };
        };

        var found = false;
        let requestsArray = requests.toArray();
        for (req in requestsArray.values()) {
          if (req.userId == userId) {
            found := true;
          };
        };

        if (not found) {
          Runtime.trap("Request not found");
        };

        // Add to approved attendees
        let newList = hangout.approvedAttendees.clone();
        newList.add(userId);
        let updatedHangout = {
          id = hangout.id;
          author = hangout.author;
          title = hangout.title;
          description = hangout.description;
          date = hangout.date;
          location = hangout.location;
          maxSpots = hangout.maxSpots;
          approvedAttendees = newList;
        };

        hangoutPosts.add(hangoutId, updatedHangout);

        // Remove from requests
        let filteredRequests = List.empty<HangoutRequest>();
        for (req in requestsArray.values()) {
          if (req.userId != userId) {
            filteredRequests.add(req);
          };
        };
        hangoutRequests.add(hangoutId, filteredRequests);
      };
    };
  };

  public shared ({ caller }) func denyHangoutRequest(hangoutId : HangoutId, userId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can deny hangout requests");
    };

    switch (hangoutPosts.get(hangoutId)) {
      case (null) { Runtime.trap("Hangout does not exist") };
      case (?hangout) {
        // Only the author can deny
        if (hangout.author != caller) {
          Runtime.trap("Unauthorized: Only the hangout author can deny requests");
        };

        // Remove from requests
        let requests = switch (hangoutRequests.get(hangoutId)) {
          case (null) { Runtime.trap("No requests found") };
          case (?list) { list };
        };

        let requestsArray = requests.toArray();
        let filteredRequests = List.empty<HangoutRequest>();
        for (req in requestsArray.values()) {
          if (req.userId != userId) {
            filteredRequests.add(req);
          };
        };
        hangoutRequests.add(hangoutId, filteredRequests);
      };
    };
  };

  // Messaging
  public shared ({ caller }) func sendMessage(recipient : UserId, content : Text) : async Message {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (caller == recipient) {
      Runtime.trap("Cannot send message to yourself");
    };

    // Check if recipient exists
    switch (profiles.get(recipient)) {
      case (null) { Runtime.trap("Recipient does not exist") };
      case (?_) {};
    };

    // Determine message status based on friendship
    let status = if (areFriends(caller, recipient)) {
      #approved; // Friends can message freely
    } else {
      #pending; // Strangers send message requests
    };

    let message : Message = {
      id = nextMessageId;
      sender = caller;
      recipient;
      content;
      timestamp = Time.now();
      status;
    };

    messages.add(nextMessageId, message);

    // Add to recipient's messages or requests
    if (status == #pending) {
      let requests = switch (messageRequests.get(recipient)) {
        case (null) { List.empty<MessageId>() };
        case (?list) { list };
      };
      requests.add(nextMessageId);
      messageRequests.add(recipient, requests);
    } else {
      let recipientMessages = switch (userMessages.get(recipient)) {
        case (null) { List.empty<MessageId>() };
        case (?list) { list };
      };
      recipientMessages.add(nextMessageId);
      userMessages.add(recipient, recipientMessages);
    };

    // Add to sender's messages
    let senderMessages = switch (userMessages.get(caller)) {
      case (null) { List.empty<MessageId>() };
      case (?list) { list };
    };
    senderMessages.add(nextMessageId);
    userMessages.add(caller, senderMessages);

    nextMessageId += 1;
    message;
  };

  public shared ({ caller }) func approveMessage(messageId : MessageId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can approve messages");
    };

    switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message does not exist") };
      case (?message) {
        // Only the recipient can approve
        if (message.recipient != caller) {
          Runtime.trap("Unauthorized: Only the recipient can approve this message");
        };

        if (message.status != #pending) {
          Runtime.trap("Message is not pending approval");
        };

        // Update message status
        let updatedMessage = {
          id = message.id;
          sender = message.sender;
          recipient = message.recipient;
          content = message.content;
          timestamp = message.timestamp;
          status = #approved;
        };
        messages.add(messageId, updatedMessage);

        // Move from requests to messages
        switch (messageRequests.get(caller)) {
          case (null) {};
          case (?requests) {
            let requestsArray = requests.toArray();
            let filteredRequests = List.empty<MessageId>();
            for (reqId in requestsArray.values()) {
              if (reqId != messageId) {
                filteredRequests.add(reqId);
              };
            };
            messageRequests.add(caller, filteredRequests);
          };
        };

        let recipientMessages = switch (userMessages.get(caller)) {
          case (null) { List.empty<MessageId>() };
          case (?list) { list };
        };
        recipientMessages.add(messageId);
        userMessages.add(caller, recipientMessages);
      };
    };
  };

  public shared ({ caller }) func declineMessage(messageId : MessageId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can decline messages");
    };

    switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message does not exist") };
      case (?message) {
        // Only the recipient can decline
        if (message.recipient != caller) {
          Runtime.trap("Unauthorized: Only the recipient can decline this message");
        };

        if (message.status != #pending) {
          Runtime.trap("Message is not pending approval");
        };

        // Update message status
        let updatedMessage = {
          id = message.id;
          sender = message.sender;
          recipient = message.recipient;
          content = message.content;
          timestamp = message.timestamp;
          status = #declined;
        };
        messages.add(messageId, updatedMessage);

        // Remove from requests
        switch (messageRequests.get(caller)) {
          case (null) {};
          case (?requests) {
            let requestsArray = requests.toArray();
            let filteredRequests = List.empty<MessageId>();
            for (reqId in requestsArray.values()) {
              if (reqId != messageId) {
                filteredRequests.add(reqId);
              };
            };
            messageRequests.add(caller, filteredRequests);
          };
        };
      };
    };
  };

  // Group Chats
  public shared ({ caller }) func createGroupChat(name : Text, members : [UserId]) : async GroupChatView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create group chats");
    };

    // Ensure caller is included in members
    var callerIncluded = false;
    for (member in members.values()) {
      if (member == caller) {
        callerIncluded := true;
      };
    };

    if (not callerIncluded) {
      Runtime.trap("Creator must be included in group members");
    };

    let group : GroupChat = {
      id = nextGroupId;
      name;
      members = Map.empty<UserId, List.List<UserId>>();
      messages = List.empty<Message>();
    };

    groupChats.add(nextGroupId, group);
    nextGroupId += 1;
    GroupChat.toView(group);
  };

  public query ({ caller }) func getGroupChat(groupId : GroupId) : async ?GroupChatView {
    // Public function - anyone can view group chats (including guests)
    switch (groupChats.get(groupId)) {
      case (null) { null };
      case (?group) { ?GroupChat.toView(group) };
    };
  };

  public shared ({ caller }) func sendGroupMessage(groupId : GroupId, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send group messages");
    };

    // Check if caller is a member
    switch (groupMembers.get(groupId)) {
      case (null) { Runtime.trap("Group does not exist") };
      case (?members) {
        var isMember = false;
        let membersArray = members.toArray();
        for (member in membersArray.values()) {
          if (member == caller) {
            isMember := true;
          };
        };

        if (not isMember) {
          Runtime.trap("Unauthorized: Only group members can send messages");
        };
      };
    };

    // Add message to group
    switch (groupChats.get(groupId)) {
      case (null) { Runtime.trap("Group does not exist") };
      case (?group) {
        let message : Message = {
          id = nextMessageId;
          sender = caller;
          recipient = Principal.fromText("aaaaa-aa"); // Placeholder for group
          content;
          timestamp = Time.now();
          status = #approved;
        };

        let updatedMessages = group.messages.clone();
        updatedMessages.add(message);

        let updatedGroup = {
          id = group.id;
          name = group.name;
          members = group.members;
          messages = updatedMessages;
        };

        groupChats.add(groupId, updatedGroup);
        nextMessageId += 1;
      };
    };
  };

  public shared ({ caller }) func addGroupMember(groupId : GroupId, userId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add group members");
    };

    // Check if caller is a member (only members can add others)
    switch (groupMembers.get(groupId)) {
      case (null) { Runtime.trap("Group does not exist") };
      case (?members) {
        var isMember = false;
        let membersArray = members.toArray();
        for (member in membersArray.values()) {
          if (member == caller) {
            isMember := true;
          };
        };

        if (not isMember) {
          Runtime.trap("Unauthorized: Only group members can add new members");
        };

        // Add new member
        members.add(userId);
        groupMembers.add(groupId, members);
      };
    };
  };

  // Feed
  public query ({ caller }) func getHomeFeed() : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view feeds");
    };

    let feedPosts = List.empty<Post>();

    switch (followings.get(caller)) {
      case (null) {
        // No followings, return empty feed
        return [];
      };
      case (?followingSet) {
        let followingIds = followingSet.toArray();
        for (id in followingIds.values()) {
          switch (userPosts.get(id)) {
            case (?postIds) {
              let postIdArray = postIds.toArray();
              for (postId in postIdArray.values()) {
                switch (posts.get(postId)) {
                  case (?post) { feedPosts.add(post) };
                  case (null) {};
                };
              };
            };
            case (null) {};
          };
        };
      };
    };

    let feedPostsArray = feedPosts.toArray();
    feedPostsArray.sort(Post.compareByTimestamp);
  };

  // Admin functions
  public shared ({ caller }) func adminDeletePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    posts.remove(postId);
  };

  public shared ({ caller }) func adminDeleteHangout(hangoutId : HangoutId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    hangoutPosts.remove(hangoutId);
    hangoutRequests.remove(hangoutId);
  };

  public shared ({ caller }) func adminDeleteMessage(messageId : MessageId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    messages.remove(messageId);
  };
};
