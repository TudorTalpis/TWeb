using TWeb.BusinessLayer.Interfaces;
using TWeb.BusinessLayer.Structure;

namespace TWeb.BusinessLayer
{
    public class BusinessLogic
    {
        public BusinessLogic() { }

        public IUserAction UserAction()
        {
            return new UserActionExecution();
        }

        public IServiceAction ServiceAction()
        {
            return new ServiceActionExecution();
        }

        public IProviderAction ProviderAction()
        {
            return new ProviderActionExecution();
        }

        public IBookingAction BookingAction()
        {
            return new BookingActionExecution();
        }
    }
}
