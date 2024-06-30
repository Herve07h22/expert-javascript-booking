export function book(payload) {
    const {accomodationId,adults,children,from,to} = payload;
    return async function (dependencies, context) {
        const user = context.loggedUser; // Peut-être null !
        if (!user) {
            return context.withError(shouldBeLogged())
        }
        const booking = {
            tenantId:user.id, 
            accomodationId,
            hosts : {adults,children},
            interval : {from,to}
            };
        await dependencies.bookings.save(booking);
        return context
    }
}
 
function shouldBeLogged() {
    return new Error("User should be logged in")
}
