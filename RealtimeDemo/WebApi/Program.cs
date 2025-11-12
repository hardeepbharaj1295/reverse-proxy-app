using WebApi.Hubs;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args);

// CORS: allow Angular (4200) and the Gateway (5001)
const string CorsPolicy = "client";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, p =>
        p.WithOrigins(
             "http://localhost:4200",
             "https://localhost:4200",
             "https://localhost:5001", // gateway
             "http://localhost:5001"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
    );
});

builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwagger();

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);

// Minimal “health” check
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Map the hub (keep this path stable for the Angular client + YARP)
app.MapHub<NotificationsHub>("/hubs/notifications");

app.Run();
