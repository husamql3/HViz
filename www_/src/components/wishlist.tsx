import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { actions } from "astro:actions";

export const Wishlist = () => {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    try {
      const result = await actions.joinWaitlist({ email });
      
      if (result.data?.success) {
        setMessage({ type: 'success', text: result.data.message });
        setEmail(""); // Clear the input on success
      } else {
        setMessage({ type: 'error', text: result.data?.message || 'Failed to join waitlist' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className="space-y-4 w-full" onSubmit={handleSubmit}>
      <Input
        placeholder="your@email.com"
        variant="lg"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isPending}
        required
        autoSave="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <Button
        size="lg"
        className="hover:bg-green-700 transition-colors font-medium w-full"
        type="submit"
        disabled={isPending}
      >
        {isPending ? 'Joining...' : 'join waitlist'}
      </Button>
      
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          {message.text}
        </p>
      )}
    </form>
  );
};