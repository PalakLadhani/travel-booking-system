using { travel } from '../db/schema';

service TravelService @(path: '/travel') {

  @readonly
  entity Destinations as projection on travel.Destinations;

  @readonly
  entity TravelOptions as projection on travel.TravelOptions;

  @readonly
  entity Hotels as projection on travel.Hotels;

  entity Bookings as projection on travel.Bookings;

  // ---- Agent actions ----

  action chatWithAgent(
    threadId : String,
    message  : String
  ) returns {
    threadId      : String;
    reply         : String;
    needsApproval : Boolean;
    approvalData  : String;
  };

  action approveBooking(
    threadId : String,
    decision : String   // "approve" | "reject"
  ) returns {
    reply  : String;
    status : String;
  };
}