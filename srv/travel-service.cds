using{travel} from '../db/schema';
service TravelService @(path: '/travel'){

    @randonly
    entity Hotels as projection on travel.Hotels;
    entity Bookings as projection on travel.Bookings;

    //Actions for the LangGraph agent - wired up in Phase 4
    action chatWithAgent(
        threadId:String,
        message:String
    )returns{
        threadId:String;
        reply:String;
        needsApproval:Boolean;
        approvalData:String; //JSON-stringified payload
    };

    action approveBooking(
        threadId:String,
        decision:String //"approve" | "reject"
    )
    returns{
        reply:String;
        status:String;
    };
}