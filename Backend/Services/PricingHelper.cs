namespace Backend.Services;

public sealed class PriceCalculationResult
{
    public decimal OriginalPrice { get; init; }
    public decimal FinalPrice { get; init; }
    public decimal DiscountAmount { get; init; }
    public bool DiscountApplied { get; init; }
    public string? DiscountType { get; init; }
    public decimal DiscountValue { get; init; }
    public string DiscountLabel { get; init; } = string.Empty;
}

public static class PricingHelper
{
    public static PriceCalculationResult Calculate(
        decimal originalPrice,
        string? discountType,
        decimal? discountValue,
        DateTime? discountStart,
        DateTime? discountEnd,
        DateTime? nowUtc = null)
    {
        var currentTime = nowUtc ?? DateTime.UtcNow;
        var normalizedType = string.IsNullOrWhiteSpace(discountType) ? null : discountType.Trim().ToLowerInvariant();
        var value = discountValue ?? 0m;
        var hasActiveWindow = (!discountStart.HasValue || discountStart.Value <= currentTime)
            && (!discountEnd.HasValue || discountEnd.Value >= currentTime);
        var isEligible = !string.IsNullOrWhiteSpace(normalizedType) && value > 0m && hasActiveWindow;

        if (!isEligible)
        {
            return new PriceCalculationResult
            {
                OriginalPrice = RoundPrice(originalPrice),
                FinalPrice = RoundPrice(originalPrice),
                DiscountAmount = 0m,
                DiscountApplied = false,
                DiscountType = null,
                DiscountValue = 0m,
                DiscountLabel = string.Empty
            };
        }

        decimal discountAmount = normalizedType switch
        {
            "percentage" => originalPrice * (value / 100m),
            "fixed" => value,
            _ => 0m,
        };

        if (discountAmount <= 0m)
        {
            return new PriceCalculationResult
            {
                OriginalPrice = RoundPrice(originalPrice),
                FinalPrice = RoundPrice(originalPrice),
                DiscountAmount = 0m,
                DiscountApplied = false,
                DiscountType = null,
                DiscountValue = 0m,
                DiscountLabel = string.Empty
            };
        }

        var finalPrice = Math.Max(0m, originalPrice - discountAmount);

        return new PriceCalculationResult
        {
            OriginalPrice = RoundPrice(originalPrice),
            FinalPrice = RoundPrice(finalPrice),
            DiscountAmount = RoundPrice(discountAmount),
            DiscountApplied = true,
            DiscountType = normalizedType,
            DiscountValue = value,
            DiscountLabel = normalizedType == "percentage"
                ? $"{value:0.#}% OFF"
                : $"${RoundPrice(value):0.00} OFF"
        };
    }

    private static decimal RoundPrice(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
