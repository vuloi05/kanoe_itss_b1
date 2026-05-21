using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "chapters",
                columns: table => new
                {
                    chapter_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    level_id = table.Column<int>(type: "integer", nullable: false),
                    title_vi = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    title_jp = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    icon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("chapters_pkey", x => x.chapter_id);
                    table.ForeignKey(
                        name: "chapters_level_id_fkey",
                        column: x => x.level_id,
                        principalTable: "content_levels",
                        principalColumn: "level_id");
                });

            migrationBuilder.CreateTable(
                name: "lessons",
                columns: table => new
                {
                    lesson_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    chapter_id = table.Column<int>(type: "integer", nullable: false),
                    scene_label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    scene_label_jp = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    title_vi = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    title_jp = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    subtitle_vi = table.Column<string>(type: "text", nullable: false),
                    subtitle_jp = table.Column<string>(type: "text", nullable: false),
                    tag = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    tag_jp = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    duration_minutes = table.Column<int>(type: "integer", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_locked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("lessons_pkey", x => x.lesson_id);
                    table.ForeignKey(
                        name: "lessons_chapter_id_fkey",
                        column: x => x.chapter_id,
                        principalTable: "chapters",
                        principalColumn: "chapter_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "lesson_dialogues",
                columns: table => new
                {
                    dialogue_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    lesson_id = table.Column<Guid>(type: "uuid", nullable: false),
                    speaker = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    speaker_jp = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    line_vi = table.Column<string>(type: "text", nullable: false),
                    line_jp = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    highlight_words_json = table.Column<string>(type: "jsonb", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("lesson_dialogues_pkey", x => x.dialogue_id);
                    table.ForeignKey(
                        name: "lesson_dialogues_lesson_id_fkey",
                        column: x => x.lesson_id,
                        principalTable: "lessons",
                        principalColumn: "lesson_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "lesson_tone_notes",
                columns: table => new
                {
                    note_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    lesson_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    desc_vi = table.Column<string>(type: "text", nullable: false),
                    desc_jp = table.Column<string>(type: "text", nullable: false),
                    example = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("lesson_tone_notes_pkey", x => x.note_id);
                    table.ForeignKey(
                        name: "lesson_tone_notes_lesson_id_fkey",
                        column: x => x.lesson_id,
                        principalTable: "lessons",
                        principalColumn: "lesson_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_chapters_level_id",
                table: "chapters",
                column: "level_id");

            migrationBuilder.CreateIndex(
                name: "IX_lesson_dialogues_lesson_id",
                table: "lesson_dialogues",
                column: "lesson_id");

            migrationBuilder.CreateIndex(
                name: "IX_lesson_tone_notes_lesson_id",
                table: "lesson_tone_notes",
                column: "lesson_id");

            migrationBuilder.CreateIndex(
                name: "IX_lessons_chapter_id",
                table: "lessons",
                column: "chapter_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lesson_dialogues");

            migrationBuilder.DropTable(
                name: "lesson_tone_notes");

            migrationBuilder.DropTable(
                name: "lessons");

            migrationBuilder.DropTable(
                name: "chapters");
        }
    }
}
