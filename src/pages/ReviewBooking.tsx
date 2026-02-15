import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/AppContext";
import { generateId } from "@/lib/storage";
import { formatDate } from "@/lib/booking";

const ReviewBooking = () => {
  const { bookingId } = useParams();
  const { state, dispatch, currentUser } = useAppStore();
  const navigate = useNavigate();

  const booking = state.bookings.find((b) => b.id === bookingId);
  const alreadyReviewed = state.reviews.some((r) => r.bookingId === bookingId);
  const provider = booking ? state.providerProfiles.find((p) => p.id === booking.providerId) : null;
  const service = booking ? state.services.find((s) => s.id === booking.serviceId) : null;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!booking || !provider || !service) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-muted-foreground text-sm">Booking not found.</p>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-4 rounded-full">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (booking.status !== "COMPLETED") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-muted-foreground text-sm">This booking hasn't been completed yet.</p>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-4 rounded-full">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (alreadyReviewed || submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mb-5">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Thank you for your review!</h1>
        <p className="text-muted-foreground text-sm mb-6">Your feedback helps other users find great services.</p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/dashboard")} className="rounded-full h-10 px-6">My Bookings</Button>
          <Link to={`/providers/${provider.id}`}>
            <Button variant="outline" className="rounded-full h-10 px-6">View Provider</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!comment.trim() || !currentUser) return;
    dispatch({
      type: "ADD_REVIEW",
      payload: {
        id: generateId(),
        bookingId: booking.id,
        providerId: booking.providerId,
        userId: currentUser.id,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        userName: currentUser.name,
      },
    });
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="rounded-2xl border bg-card p-6 shadow-card mb-6">
        <h1 className="text-xl font-bold mb-1">Leave a Review</h1>
        <p className="text-muted-foreground text-sm">
          {service.title} · {provider.name} · {formatDate(booking.date)}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-card space-y-5">
        <div>
          <p className="text-sm font-medium mb-3">How was your experience?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button key={r} onClick={() => setRating(r)} className="transition-all duration-200">
                <Star className={`h-7 w-7 ${r <= rating ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Your feedback</p>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="rounded-xl text-sm min-h-[100px]"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!comment.trim()}
          className="w-full rounded-xl gradient-primary text-primary-foreground h-11 text-sm font-medium"
        >
          Submit Review
        </Button>
      </div>
    </div>
  );
};

export default ReviewBooking;
