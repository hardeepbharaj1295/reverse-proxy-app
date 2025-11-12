using Microsoft.AspNetCore.SignalR;

namespace WebApi.Hubs
{
    public class NotificationsHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("ReceiveMessage", $"Connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        // Angular will call this with connection.invoke('SendMessage', 'text')
        public async Task SendMessage(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }
    }
}
