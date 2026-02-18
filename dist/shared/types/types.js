export var Action;
(function (Action) {
    Action["CREATE"] = "create";
    Action["READ"] = "read";
    Action["UPDATE"] = "update";
    Action["DELETE"] = "delete";
})(Action || (Action = {}));
export var Resource;
(function (Resource) {
    Resource["LISTING"] = "Listing";
    Resource["BOOKING"] = "Booking";
    Resource["Customer"] = "Customer";
    Resource["USER"] = "USER";
})(Resource || (Resource = {}));
