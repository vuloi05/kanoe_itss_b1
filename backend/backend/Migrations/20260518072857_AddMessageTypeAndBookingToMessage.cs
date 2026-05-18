using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMessageTypeAndBookingToMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "booking_id",
                table: "messages",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "message_type",
                table: "messages",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_messages_booking_id",
                table: "messages",
                column: "booking_id");

            migrationBuilder.AddForeignKey(
                name: "FK_messages_bookings_booking_id",
                table: "messages",
                column: "booking_id",
                principalTable: "bookings",
                principalColumn: "booking_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_messages_bookings_booking_id",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "IX_messages_booking_id",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "booking_id",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "message_type",
                table: "messages");
        }
    }
}
