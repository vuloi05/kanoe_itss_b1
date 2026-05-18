using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPresenceToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_online",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_seen",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "bookings",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<Guid>(
                name: "conversation_id",
                table: "bookings",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_bookings_conversation_id",
                table: "bookings",
                column: "conversation_id");

            migrationBuilder.AddForeignKey(
                name: "FK_bookings_conversations_conversation_id",
                table: "bookings",
                column: "conversation_id",
                principalTable: "conversations",
                principalColumn: "conversation_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_bookings_conversations_conversation_id",
                table: "bookings");

            migrationBuilder.DropIndex(
                name: "IX_bookings_conversation_id",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "is_online",
                table: "users");

            migrationBuilder.DropColumn(
                name: "last_seen",
                table: "users");

            migrationBuilder.DropColumn(
                name: "conversation_id",
                table: "bookings");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "bookings",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);
        }
    }
}
