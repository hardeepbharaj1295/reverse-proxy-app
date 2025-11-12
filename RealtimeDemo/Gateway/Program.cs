using Yarp.ReverseProxy;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.UseHttpsRedirection();

// (Optional) a quick health endpoint for the gateway itself
app.MapGet("/health", () => Results.Ok(new { gateway = "ok" }));

// Needed for upgrade requests; in minimal hosting this is already present,
// but calling UseWebSockets explicitly is safe and clear.
app.UseWebSockets();

app.MapReverseProxy();

app.Run();
