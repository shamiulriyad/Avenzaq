using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerDocumentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BankStatementUrl",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NidDocumentUrl",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TinDocumentUrl",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TradeLicenseUrl",
                table: "SellerProfiles",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BankStatementUrl",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "NidDocumentUrl",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "TinDocumentUrl",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "TradeLicenseUrl",
                table: "SellerProfiles");
        }
    }
}
