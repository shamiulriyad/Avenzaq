using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Backend.Data;

public class MarketplaceDbContext : DbContext
{
    public MarketplaceDbContext(DbContextOptions<MarketplaceDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<SellerProfile> SellerProfiles => Set<SellerProfile>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<SellerProduct> SellerProducts => Set<SellerProduct>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<VariantImage> VariantImages => Set<VariantImage>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<SellerOrder> SellerOrders => Set<SellerOrder>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<FeaturedPromotion> FeaturedPromotions => Set<FeaturedPromotion>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .HasMaxLength(200);

        modelBuilder.Entity<SellerProfile>()
            .HasOne(s => s.User)
            .WithOne(u => u.SellerProfile)
            .HasForeignKey<SellerProfile>(s => s.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SellerProfile>()
            .HasIndex(s => s.ShopSlug)
            .IsUnique();

        modelBuilder.Entity<Category>()
            .HasIndex(c => c.Slug)
            .IsUnique();

        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Seller)
            .WithMany(s => s.Products)
            .HasForeignKey(p => p.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SellerProduct>()
            .HasOne(sp => sp.Product)
            .WithMany(p => p.SellerProducts)
            .HasForeignKey(sp => sp.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SellerProduct>()
            .HasOne(sp => sp.Seller)
            .WithMany(s => s.SellerProducts)
            .HasForeignKey(sp => sp.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SellerProduct>()
            .HasIndex(sp => new { sp.ProductId, sp.SellerId })
            .IsUnique();

        modelBuilder.Entity<Cart>()
            .HasOne(c => c.Customer)
            .WithMany(u => u.Carts)
            .HasForeignKey(c => c.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.Cart)
            .WithMany(c => c.Items)
            .HasForeignKey(ci => ci.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.Seller)
            .WithMany()
            .HasForeignKey(ci => ci.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.Variant)
            .WithMany()
            .HasForeignKey(ci => ci.VariantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Customer)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SellerOrder>()
            .HasOne(so => so.Order)
            .WithMany(o => o.SellerOrders)
            .HasForeignKey(so => so.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SellerOrder>()
            .HasOne(so => so.Seller)
            .WithMany(s => s.SellerOrders)
            .HasForeignKey(so => so.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.SellerOrder)
            .WithMany(so => so.Items)
            .HasForeignKey(oi => oi.SellerOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Product)
            .WithMany()
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Seller)
            .WithMany()
            .HasForeignKey(oi => oi.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Variant)
            .WithMany()
            .HasForeignKey(oi => oi.VariantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Customer)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Product)
            .WithMany(p => p.Reviews)
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FeaturedPromotion>()
            .HasOne(fp => fp.Product)
            .WithMany()
            .HasForeignKey(fp => fp.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FeaturedPromotion>()
            .HasOne(fp => fp.Seller)
            .WithMany()
            .HasForeignKey(fp => fp.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(12, 2);

        modelBuilder.Entity<Order>()
            .Property(o => o.TotalAmount)
            .HasPrecision(12, 2);

        modelBuilder.Entity<SellerOrder>()
            .Property(o => o.Subtotal)
            .HasPrecision(12, 2);

        modelBuilder.Entity<SellerOrder>()
            .Property(o => o.CommissionAmount)
            .HasPrecision(12, 2);

        modelBuilder.Entity<SellerOrder>()
            .Property(o => o.NetAmount)
            .HasPrecision(12, 2);

        modelBuilder.Entity<OrderItem>()
            .Property(o => o.UnitPrice)
            .HasPrecision(12, 2);

        modelBuilder.Entity<OrderItem>()
            .Property(o => o.LineTotal)
            .HasPrecision(12, 2);

        // Notification configuration
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notification>()
            .HasIndex(n => new { n.UserId, n.CreatedAtUtc })
            .IsDescending();

        modelBuilder.Entity<Notification>()
            .HasIndex(n => n.IsRead);

        // ProductVariant configuration
        modelBuilder.Entity<ProductVariant>()
            .HasOne(pv => pv.SellerProduct)
            .WithMany(sp => sp.Variants)
            .HasForeignKey(pv => pv.SellerProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductVariant>()
            .HasOne(pv => pv.Product)
            .WithMany(p => p.Variants)
            .HasForeignKey(pv => pv.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProductVariant>()
            .Property(pv => pv.Price)
            .HasPrecision(12, 2);

        modelBuilder.Entity<ProductVariant>()
            .Property(pv => pv.DiscountValue)
            .HasPrecision(12, 2);

        modelBuilder.Entity<CartItem>()
            .Property(ci => ci.OriginalPrice)
            .HasPrecision(12, 2);

        modelBuilder.Entity<CartItem>()
            .Property(ci => ci.FinalPrice)
            .HasPrecision(12, 2);

        modelBuilder.Entity<CartItem>()
            .Property(ci => ci.DiscountAmount)
            .HasPrecision(12, 2);

        modelBuilder.Entity<CartItem>()
            .Property(ci => ci.UnitPrice)
            .HasPrecision(12, 2);

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.OriginalPrice)
            .HasPrecision(12, 2);

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.FinalPrice)
            .HasPrecision(12, 2);

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.DiscountAmount)
            .HasPrecision(12, 2);

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.UnitPrice)
            .HasPrecision(12, 2);

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.LineTotal)
            .HasPrecision(12, 2);

        modelBuilder.Entity<ProductVariant>()
            .HasIndex(pv => pv.SKU)
            .IsUnique();

        // VariantImage configuration
        modelBuilder.Entity<VariantImage>()
            .HasOne(vi => vi.Variant)
            .WithMany(pv => pv.Images)
            .HasForeignKey(vi => vi.VariantId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public override int SaveChanges()
    {
        NormalizeUserEmails();
        return base.SaveChanges();
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        NormalizeUserEmails();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        NormalizeUserEmails();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        NormalizeUserEmails();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void NormalizeUserEmails()
    {
        IEnumerable<EntityEntry<User>> entries = ChangeTracker.Entries<User>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.Email = NormalizeEmail(entry.Entity.Email);
        }
    }

    private static string NormalizeEmail(string email)
        => email.Trim().ToLowerInvariant();
}
