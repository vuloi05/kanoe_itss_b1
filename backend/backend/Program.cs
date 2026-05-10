using backend.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<VietImmerseDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllersWithViews();
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

// ---- ĐOẠN CODE KIỂM TRA KẾT NỐI DATABASE ----
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<VietImmerseDbContext>();

        // Lệnh CanConnect() sẽ thử mở một kết nối ngắn tới Postgres
        if (context.Database.CanConnect())
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("🎉 KẾT NỐI DATABASE POSTGRESQL THÀNH CÔNG! 🎉");
            Console.WriteLine("==================================================");
        }
        else
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("❌ KẾT NỐI DATABASE THẤT BẠI! Vui lòng kiểm tra lại cấu hình.");
            Console.WriteLine("==================================================");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("==================================================");
        Console.WriteLine($"❌ ĐÃ XẢY RA LỖI KHI KẾT NỐI DATABASE: {ex.Message}");
        Console.WriteLine("==================================================");
    }
}
// ---------------------------------------------

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
