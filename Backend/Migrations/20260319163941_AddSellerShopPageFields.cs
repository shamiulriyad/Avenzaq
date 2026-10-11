using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerShopPageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BannerUrl",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LogoUrl",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShopSlug",
                table: "SellerProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_SellerProfiles_ShopSlug",
                table: "SellerProfiles",
                column: "ShopSlug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SellerProfiles_ShopSlug",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "BannerUrl",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "LogoUrl",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "ShopSlug",
                table: "SellerProfiles");
        }
    }
}
