import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "oklch(0.65 0.28 305)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: "oklch(0.7 0.22 20)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm flex flex-col items-center text-center relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow"
        >
          <MapPin className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-2 gradient-text"
        >
          HangOut
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-base mb-10"
        >
          Plan hangouts. Meet people. Make memories.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3 mb-10 w-full"
        >
          {[
            { icon: MapPin, label: "Create & join hangout events" },
            { icon: Users, label: "Follow friends & build your crew" },
            { icon: MessageCircle, label: "Chat with friends & groups" },
            { icon: Zap, label: "Stories, posts & hangout videos" },
          ].map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 text-left"
            >
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-foreground/80">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full"
        >
          <Button
            data-ocid="login.primary_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full h-14 text-base font-semibold rounded-2xl gradient-primary border-0 text-white shadow-glow"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.22 20))",
            }}
          >
            {isLoggingIn ? "Connecting..." : "Get Started"}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Powered by Internet Identity — your private, secure login
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
