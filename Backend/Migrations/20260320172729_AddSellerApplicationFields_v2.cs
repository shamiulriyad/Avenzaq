using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerApplicationFields_v2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AcceptsCOD",
                table: "SellerProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "BankAccountName",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccountNumber",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankBranch",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BusinessLicense",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BusinessType",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstablishedYear",
                table: "SellerProfiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "OwnerAddress",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OwnerEmail",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OwnerIdNumber",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OwnerIdType",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OwnerName",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OwnerPhone",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProcessingTime",
                table: "SellerProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReturnPolicy",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingPolicy",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaxId",
                table: "SellerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Website",
                table: "SellerProfiles",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AcceptsCOD",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "BankAccountName",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "BankAccountNumber",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "BankBranch",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "BankName",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "BusinessLicense",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "BusinessType",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "EstablishedYear",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "OwnerAddress",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "OwnerEmail",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "OwnerIdNumber",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "OwnerIdType",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "OwnerName",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "OwnerPhone",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "ProcessingTime",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "ReturnPolicy",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "ShippingPolicy",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "TaxId",
                table: "SellerProfiles");

            migrationBuilder.DropColumn(
                name: "Website",
                table: "SellerProfiles");
        }
    }
}
