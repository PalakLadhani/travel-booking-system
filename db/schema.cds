namespace travel;

using { cuid, managed } from '@sap/cds/common';

/**
 * Destinations — places the agent can recommend and find travel/hotels for.
 */
entity Destinations : cuid, managed {
  name              : String(100) not null;
  state             : String(50);
  country           : String(50) default 'India';
  description       : String(1000);
  bestTimeToVisit   : String(200);
  popularFor        : String(500);
  attractions       : String(1000);
  averageHotelPrice : Decimal(10,2);
  imageUrl          : String(500);
  isFeatured        : Boolean default false;

  // Reverse association — convenient when querying "hotels in this destination"
  hotels : Association to many Hotels on hotels.destination = $self;
}

/**
 * Travel options — flights, trains, buses between cities.
 * Routes with schedules, not date-specific. Booking date is set per-booking.
 */
entity TravelOptions : cuid, managed {
  transportType  : String(20) not null;   // "flight" | "train" | "bus"
  provider       : String(100);            // "IndiGo", "IRCTC", "VRL Travels"
  routeNumber    : String(50);             // "6E-345", "12716"
  fromCity       : String(50) not null;
  toCity         : String(50) not null;
  departureTime  : String(10);             // "08:30" (HH:MM)
  arrivalTime    : String(10);
  durationHours  : Decimal(4,2);           // 2.5 = 2h 30m
  price          : Decimal(10,2) not null;
  availableSeats : Integer default 50;
  daysOfWeek     : String(50);             // "Daily" or "Mon,Wed,Fri"
  classType      : String(30);             // "Economy", "AC 3-Tier", "Sleeper", etc.
}

/**
 * Hotels (existing entity, with added destination link).
 */
entity Hotels : cuid, managed {
  name          : String(100) not null;
  city          : String(50) not null;
  country       : String(50);
  description   : String(500);
  pricePerNight : Decimal(10,2) not null;
  rating        : Decimal(2,1);
  available     : Boolean default true;
  imageUrl      : String(500);

  // NEW: link to destination
  destination   : Association to Destinations;
}

/**
 * Bookings — unified table for both hotel and travel bookings.
 * `bookingType` discriminates between the two; type-specific fields are nullable.
 */
entity Bookings : cuid, managed {
  bookingType        : String(20) not null;   // "hotel" | "travel"
  status             : String(20) default 'pending';
  guestName          : String(100) not null;
  guestEmail         : String(100);
  totalPrice         : Decimal(10,2);
  agentThreadId      : String(100);

  // Hotel-specific (filled when bookingType = "hotel")
  hotel              : Association to Hotels;
  checkIn            : Date;
  checkOut           : Date;
  numberOfGuests     : Integer;

  // Travel-specific (filled when bookingType = "travel")
  travelOption       : Association to TravelOptions;
  travelDate         : Date;
  numberOfPassengers : Integer;
}