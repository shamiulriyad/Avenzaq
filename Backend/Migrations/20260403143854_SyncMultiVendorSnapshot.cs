using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class SyncMultiVendorSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariants_Products_ProductId",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "AttributeFields",
                table: "Categories");

            migrationBuilder.AddColumn<Guid>(
                name: "SellerProductId",
                table: "ProductVariants",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "SellerId",
                table: "CartItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "VariantId",
                table: "CartItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SellerProducts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    SellerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SellerProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SellerProducts_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SellerProducts_SellerProfiles_SellerId",
                        column: x => x.SellerId,
                        principalTable: "SellerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.Sql(
                "INSERT INTO \"SellerProducts\" (\"Id\", \"ProductId\", \"SellerId\", \"CreatedAtUtc\") " +
                "SELECT p.\"Id\", p.\"Id\", p.\"SellerId\", NOW() " +
                "FROM \"Products\" p " +
                "WHERE NOT EXISTS (" +
                "SELECT 1 FROM \"SellerProducts\" sp " +
                "WHERE sp.\"ProductId\" = p.\"Id\" AND sp.\"SellerId\" = p.\"SellerId\")");

            migrationBuilder.Sql(
                "UPDATE \"ProductVariants\" pv " +
                "SET \"SellerProductId\" = sp.\"Id\" " +
                "FROM \"SellerProducts\" sp " +
                "WHERE sp.\"ProductId\" = pv.\"ProductId\";");

            migrationBuilder.Sql(
                "UPDATE \"CartItems\" ci " +
                "SET \"SellerId\" = p.\"SellerId\" " +
                "FROM \"Products\" p " +
                "WHERE p.\"Id\" = ci.\"ProductId\";");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_SellerProductId",
                table: "ProductVariants",
                column: "SellerProductId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_SellerId",
                table: "CartItems",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_VariantId",
                table: "CartItems",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_SellerProducts_ProductId_SellerId",
                table: "SellerProducts",
                columns: new[] { "ProductId", "SellerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SellerProducts_SellerId",
                table: "SellerProducts",
                column: "SellerId");

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_ProductVariants_VariantId",
                table: "CartItems",
                column: "VariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_SellerProfiles_SellerId",
                table: "CartItems",
                column: "SellerId",
                principalTable: "SellerProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariants_Products_ProductId",
                table: "ProductVariants",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariants_SellerProducts_SellerProductId",
                table: "ProductVariants",
                column: "SellerProductId",
                principalTable: "SellerProducts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_ProductVariants_VariantId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_SellerProfiles_SellerId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariants_Products_ProductId",
                table: "ProductVariants");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariants_SellerProducts_SellerProductId",
                table: "ProductVariants");

            migrationBuilder.DropTable(
                name: "SellerProducts");

            migrationBuilder.DropIndex(
                name: "IX_ProductVariants_SellerProductId",
                table: "ProductVariants");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_SellerId",
                table: "CartItems");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_VariantId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "SellerProductId",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "SellerId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "VariantId",
                table: "CartItems");

            migrationBuilder.AddColumn<string>(
                name: "AttributeFields",
                table: "Categories",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariants_Products_ProductId",
                table: "ProductVariants",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
