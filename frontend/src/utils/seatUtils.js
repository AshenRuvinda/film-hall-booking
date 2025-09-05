// frontend/src/utils/seatUtils.js - NEW UTILITY FILE
export const getSeatDisplayText = (seat) => {
    if (typeof seat === 'string') {
      return seat;
    }
    if (typeof seat === 'object' && seat !== null) {
      return seat.seatId || seat.seatNumber || seat.id || 'Unknown Seat';
    }
    return 'Unknown Seat';
  };
  
  export const getSeatType = (seat) => {
    if (typeof seat === 'object' && seat !== null) {
      return seat.seatType || seat.type || 'regular';
    }
    return 'regular';
  };
  
  export const getSeatPrice = (seat, fallbackPrice = 10) => {
    if (typeof seat === 'object' && seat !== null && seat.price) {
      return seat.price;
    }
    return fallbackPrice;
  };
  
  export const formatSeatList = (seats) => {
    if (!seats || !Array.isArray(seats)) {
      return [];
    }
    
    return seats.map((seat, index) => ({
      id: index,
      displayText: getSeatDisplayText(seat),
      type: getSeatType(seat),
      price: getSeatPrice(seat)
    }));
  };
  
  export const getSeatsByType = (seats, seatType) => {
    if (!seats || !Array.isArray(seats)) {
      return [];
    }
    
    return seats.filter(seat => getSeatType(seat) === seatType);
  };
  
  export const getTotalSeatsByType = (seats, seatType) => {
    return getSeatsByType(seats, seatType).length;
  };