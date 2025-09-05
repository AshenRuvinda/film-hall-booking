import React, { useState, useEffect } from 'react';
import { User, Crown, X, Check } from 'lucide-react';

function SeatMap({ hall, bookedSeats = [], onSeatSelect, selectedSeats = [] }) {
  const [localSelectedSeats, setLocalSelectedSeats] = useState(selectedSeats);

  useEffect(() => {
    setLocalSelectedSeats(selectedSeats);
  }, [selectedSeats]);

  const handleSeatClick = (seatId, seatType, price) => {
    if (bookedSeats.includes(seatId)) return;
    
    const isSelected = localSelectedSeats.some(seat => seat.id === seatId);
    let updatedSeats;
    
    if (isSelected) {
      updatedSeats = localSelectedSeats.filter(seat => seat.id !== seatId);
    } else {
      updatedSeats = [...localSelectedSeats, { id: seatId, type: seatType, price }];
    }
    
    setLocalSelectedSeats(updatedSeats);
    onSeatSelect(updatedSeats);
  };

  const getSeatStatus = (seatId) => {
    if (bookedSeats.includes(seatId)) return 'booked';
    if (localSelectedSeats.some(seat => seat.id === seatId)) return 'selected';
    return 'available';
  };

  const getSeatButtonClass = (status, isBox = false) => {
    const baseClass = `relative w-8 h-8 m-0.5 rounded transition-all duration-200 flex items-center justify-center text-xs font-medium border-2 ${
      isBox ? 'rounded-lg' : 'rounded-t-lg'
    }`;
    
    switch (status) {
      case 'booked':
        return `${baseClass} bg-gray-400 border-gray-500 text-white cursor-not-allowed`;
      case 'selected':
        return `${baseClass} bg-green-500 border-green-600 text-white shadow-md transform scale-105`;
      default:
        return `${baseClass} ${
          isBox 
            ? 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200' 
            : 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
        } cursor-pointer hover:shadow-md hover:transform hover:scale-105`;
    }
  };

  const renderSeatBlock = (block, blockIndex) => {
    const seats = [];

    for (let row = 0; row < block.rows; row++) {
      const rowLetter = String.fromCharCode(65 + row); // A, B, C, etc.
      const rowSeats = [];

      for (let seat = 1; seat <= block.seatsPerRow; seat++) {
        const seatId = `${block.name}-${rowLetter}${seat}`;
        const seatNumber = `${rowLetter}${seat}`;
        const status = getSeatStatus(seatId);
        
        rowSeats.push(
          <button
            key={seatId}
            className={getSeatButtonClass(status)}
            onClick={() => handleSeatClick(seatId, 'regular', hall.pricing.regular)}
            disabled={status === 'booked'}
            title={`Seat ${seatNumber} - $${hall.pricing.regular}`}
          >
            {status === 'booked' ? (
              <X className="w-3 h-3" />
            ) : status === 'selected' ? (
              <Check className="w-3 h-3" />
            ) : (
              <User className="w-3 h-3" />
            )}
          </button>
        );
      }

      seats.push(
        <div key={`row-${row}`} className="flex items-center justify-center mb-1">
          <div className="text-xs font-medium text-gray-600 w-6 text-center mr-2">
            {rowLetter}
          </div>
          <div className="flex">
            {rowSeats}
          </div>
          <div className="text-xs font-medium text-gray-600 w-6 text-center ml-2">
            {rowLetter}
          </div>
        </div>
      );
    }

    return (
      <div key={blockIndex} className="flex flex-col items-center">
        <div className="text-center mb-2">
          <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
            {block.name}
          </span>
        </div>
        <div className="flex flex-col items-center">
          {seats}
        </div>
      </div>
    );
  };

  const renderSeatBlocksLayout = () => {
    if (!hall.seatBlocks || hall.seatBlocks.length === 0) return null;

    const blocks = hall.seatBlocks;
    const numBlocks = blocks.length;

    if (numBlocks === 1) {
      // Single block centered
      return (
        <div className="flex justify-center">
          {renderSeatBlock(blocks[0], 0)}
        </div>
      );
    }

    // Arrange blocks in rows of 2 with center aisle
    // A | B
    // C | D  
    // E | F
    const rows = [];
    
    for (let i = 0; i < blocks.length; i += 2) {
      const leftBlock = blocks[i];
      const rightBlock = blocks[i + 1];
      
      rows.push(
        <div key={`row-${i}`} className="flex justify-center items-start gap-16">
          {renderSeatBlock(leftBlock, i)}
          {rightBlock && renderSeatBlock(rightBlock, i + 1)}
        </div>
      );
    }

    return (
      <div className="space-y-12">
        {rows}
      </div>
    );
  };

  const renderBoxSeats = () => {
    if (!hall.boxSeats || hall.boxSeats.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="text-center mb-4">
          <span className="text-sm font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
            Premium Box Seats
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {hall.boxSeats.map((box, boxIndex) => {
            const boxSeats = [];
            for (let seat = 1; seat <= box.capacity; seat++) {
              const seatId = `${box.name}-${seat}`;
              const status = getSeatStatus(seatId);
              
              boxSeats.push(
                <button
                  key={seatId}
                  className={getSeatButtonClass(status, true)}
                  onClick={() => handleSeatClick(seatId, 'box', hall.pricing.box)}
                  disabled={status === 'booked'}
                  title={`${box.name} Seat ${seat} - $${hall.pricing.box}`}
                >
                  {status === 'booked' ? (
                    <X className="w-3 h-3" />
                  ) : status === 'selected' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Crown className="w-3 h-3" />
                  )}
                </button>
              );
            }

            return (
              <div key={boxIndex} className="text-center">
                <div className="text-xs font-medium text-purple-600 mb-1">
                  {box.name}
                </div>
                <div className="flex flex-wrap justify-center">
                  {boxSeats}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!hall) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading hall layout...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Screen */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-gray-800 to-gray-600 h-3 rounded-lg shadow-lg mb-2"></div>
        <div className="text-center text-sm text-gray-600 font-medium">SCREEN</div>
      </div>

      {/* Regular Seat Blocks with Smart Layout */}
      <div className="mb-8">
        {renderSeatBlocksLayout()}
      </div>

      {/* Box Seats (at the back) */}
      {renderBoxSeats()}

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded-t-lg flex items-center justify-center">
              <User className="w-3 h-3 text-blue-800" />
            </div>
            <span>Available (${hall.pricing.regular})</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 border-2 border-green-600 rounded-t-lg flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span>Selected</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 border-2 border-gray-500 rounded-t-lg flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </div>
            <span>Booked</span>
          </div>
          
          {hall.boxSeats && hall.boxSeats.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 border-2 border-purple-300 rounded-lg flex items-center justify-center">
                <Crown className="w-3 h-3 text-purple-800" />
              </div>
              <span>Premium Box (${hall.pricing.box})</span>
            </div>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      {localSelectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Selected Seats:</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {localSelectedSeats.map((seat, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {seat.id} (${seat.price})
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-900">
              Total: {localSelectedSeats.length} seat{localSelectedSeats.length !== 1 ? 's' : ''}
            </span>
            <span className="font-bold text-blue-900">
              ${localSelectedSeats.reduce((total, seat) => total + seat.price, 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeatMap;