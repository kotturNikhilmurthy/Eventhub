import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PaymentModal from "@/components/PaymentModal";
import AuditoriumSeats from "./AuditoriumSeats";
import OpenGroundPasses from "./OpenGroundPasses";
import CricketSeats from "./CricketSeats";
import StandardSeats from "./StandardSeats";
import theatres from "@/data/theatres";
import { apiService } from "@/lib/api";
import { formatTimeToIST } from "@/lib/utils";

interface Event {
  _id?: string;
  id: string;
  name: string;
  type: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  ticketPrice: string;
  venueType?: string;
  sportType?: string;
  theatres?: string[];
  showtimes?: string[];
}

interface SeatBookingModalProps {
  event: Event;
  onClose: () => void;
}

const SeatBookingModal = ({ event, onClose }: SeatBookingModalProps) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  // Ticket tiers for movies
  const tiers = [
    { id: "silver", label: "Silver", price: 80 },
    { id: "gold", label: "Gold", price: 120 },
    { id: "platinum", label: "Platinum", price: 180 },
  ];

  const initialTheatre = event.theatres && event.theatres.length > 0 ? event.theatres[0] : "";
  const [selectedTheatre, setSelectedTheatre] = useState<string>(initialTheatre);
  const [selectedShowtime, setSelectedShowtime] = useState<string>(event.time || "");
  const [selectedTier, setSelectedTier] = useState<string>(tiers[0].id);

  const tierPrice = event.type === "Movie" ? tiers.find((t) => t.id === selectedTier)!.price : parseInt(event.ticketPrice || "0");
  const totalAmount = selectedSeats.length * tierPrice;
  const isFree = tierPrice === 0;

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No Seats Selected",
        description: "Please select at least one seat to continue",
        variant: "destructive",
      });
      return;
    }

    // For movies require theatre and showtime selection
    if (event.type === "Movie") {
      if (!selectedTheatre) {
        toast({ title: "Select Theatre", description: "Please choose a theatre to proceed", variant: "destructive" });
        return;
      }
      if (!selectedShowtime) {
        toast({ title: "Select Showtime", description: "Please choose a showtime", variant: "destructive" });
        return;
      }
    }

    if (isFree) {
      completeBooking();
    } else {
      setShowPayment(true);
    }
  };

  const completeBooking = async () => {
    const booking = {
      eventId: event._id || event.id,
      eventName: event.name,
      eventType: event.type,
      date: event.date,
      time: selectedShowtime || event.time,
      venue: event.venue,
      theatre: selectedTheatre || undefined,
      tier: selectedTier || undefined,
      pricePerSeat: tierPrice,
      seats: selectedSeats,
      quantity: selectedSeats.length,
      totalPrice: totalAmount,
      paymentMethod: isFree ? "FREE" : "Paid",
      bookingDate: new Date().toISOString(),
    };

    try {
      const createdBooking = await apiService.createBooking(booking);

      const storedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      storedBookings.push({
        id: createdBooking._id || createdBooking.id,
        eventId: createdBooking.eventId,
        eventName: createdBooking.eventName,
        eventType: createdBooking.eventType,
        date: createdBooking.date,
        time: createdBooking.time,
        venue: createdBooking.venue,
        seats: createdBooking.seats || [],
        quantity: createdBooking.quantity,
        totalPrice: createdBooking.totalPrice,
        paymentMethod: createdBooking.paymentMethod,
        bookingDate: createdBooking.bookingDate,
      });
      localStorage.setItem("bookings", JSON.stringify(storedBookings));

      toast({
        title: "Booking Successful!",
        description: `Your booking ID is ${createdBooking._id || createdBooking.id}`,
      });

      onClose();
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderBookingInterface = () => {
    if (event.type === "Concert") {
      if (event.venueType === "Open Ground") {
        return <OpenGroundPasses onSelectSeats={setSelectedSeats} />;
      } else {
        return <AuditoriumSeats onSelectSeats={setSelectedSeats} />;
      }
    } else if (event.type === "Sports") {
      if (event.sportType === "Cricket") {
        return <CricketSeats onSelectSeats={setSelectedSeats} />;
      } else {
        return <StandardSeats onSelectSeats={setSelectedSeats} />;
      }
    } else if (event.type === "Movie") {
      return <StandardSeats onSelectSeats={setSelectedSeats} />;
    }
    return null;
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <Card className="w-full max-w-4xl my-8 bg-card">
          <div className="sticky top-0 bg-card border-b border-border p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{event.name}</h2>
              <p className="text-sm text-muted-foreground">
                {new Date(event.date).toLocaleDateString()} • {formatTimeToIST(event.time)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6">
            {/* Theatre selector + showtimes + tier for Movie events */}
            {event.type === "Movie" && (
              <div className="mb-4">
                <div className="mb-2 font-medium">Choose Theatre</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {(event.theatres || []).map((tName: string) => (
                    <button
                      key={tName}
                      type="button"
                      onClick={() => {
                        setSelectedTheatre(tName);
                        // update default showtime to first available of selected theatre
                        const tt = theatres.find((x) => x.name === tName);
                        if (tt && tt.showtimes && tt.showtimes.length > 0) setSelectedShowtime(tt.showtimes[0]);
                      }}
                      className={`text-left p-2 border rounded ${selectedTheatre === tName ? "border-primary bg-primary/5" : "bg-card"}`}
                    >
                      {tName}
                    </button>
                  ))}
                </div>

                <div className="mb-3">
                  <div className="mb-2 font-medium">Showtimes</div>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const tt = theatres.find((x) => x.name === selectedTheatre);
                      const options = tt?.showtimes?.length ? tt!.showtimes : event.showtimes || [event.time];
                      return options.map((s: string) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedShowtime(s)}
                          className={`px-3 py-1 rounded ${selectedShowtime === s ? "bg-primary text-primary-foreground" : "bg-muted/10"}`}
                        >
                          {s}
                        </button>
                      ));
                    })()}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="mb-2 font-medium">Ticket Tier</div>
                  <div className="flex gap-3">
                    {tiers.map((t) => (
                      <label key={t.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="tier"
                          checked={selectedTier === t.id}
                          onChange={() => setSelectedTier(t.id)}
                        />
                        <span>{t.label} — ₹{t.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {renderBookingInterface()}

            {/* Seat Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-seat-available" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-seat-selected" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-seat-booked" />
                <span>Booked</span>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Selected Seats:</span>
                <span>{selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">
                  {isFree ? "FREE" : `₹${totalAmount}`}
                </span>
              </div>
            </div>

            <Button
              onClick={handleBooking}
              disabled={selectedSeats.length === 0}
              className="w-full mt-4"
              size="lg"
            >
              {isFree ? "Confirm Booking" : `Proceed to Payment (₹${totalAmount})`}
            </Button>
          </div>
        </Card>
      </div>

      {showPayment && (
        <PaymentModal
          amount={totalAmount}
          onSuccess={completeBooking}
          onClose={() => setShowPayment(false)}
          eventName={event.name}
        />
      )}
    </>
  );
};

export default SeatBookingModal;
