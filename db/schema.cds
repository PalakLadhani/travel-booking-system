namespace travel;

using{cuid,managed} from '@sap/cds/common';

entity Hotels : cuid,managed {
    name:String(100) not null;
    city:String(50) not null;
    country:String(50);
    description:String(500);
    pricePerNight:Decimal(10,2) not null;
    rating:Decimal(2,1);
    available:Boolean default true;
    imageUrl:String(500)
    
}

entity Bookings : cuid,managed {
    hotel:Association to Hotels not null;
    guestName:String(100) not null;
    guestEmail:String(100);
    checkIn:Date not null;
    checkOut:Date not null;
    numberOfGuests:Integer default 1;
    totalPrice:Decimal(10,2);
    status:String(20) default 'pending';
            //pending | confirmed |cancelled
    agentThreadId:String(100);//ties booking to LangGraph conversation
}