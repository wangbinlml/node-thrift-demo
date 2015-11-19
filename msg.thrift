struct Msg {
   1: string service_name
   2: list<string> params,
}

exception InvalidOperation {
  1: i32 whatOp,
  2: string why
}

service GetMsg {
  map<string, string> get(1: Msg msg) throws (1:InvalidOperation ouch),
}