using System.Text.Json.Serialization;
using TargetDesafio.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<IComissaoService, ComissaoService>();
builder.Services.AddSingleton<IEstoqueService, EstoqueService>();
builder.Services.AddSingleton<IJurosService, JurosService>();

// CORS: origens permitidas via variável ALLOWED_ORIGINS (separadas por vírgula). Padrão: qualquer origem.
var origens = builder.Configuration["ALLOWED_ORIGINS"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
{
    if (origens is { Length: > 0 }) p.WithOrigins(origens).AllowAnyHeader().AllowAnyMethod();
    else p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
}));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger"));

// Render/Railway fornecem a porta via variável PORT.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port)) app.Urls.Add($"http://0.0.0.0:{port}");

app.Run();

public partial class Program;
