using Backend.Data;
using Backend.Interfaces.Repositories;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class UserRepository : IUserRepository
{
    private readonly MarketplaceDbContext _db;

    public UserRepository(MarketplaceDbContext db)
    {
        _db = db;
    }

    public Task<User?> GetByEmailAsync(string email)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return _db.Users.FirstOrDefaultAsync(x => x.Email.ToLower() == normalized);
    }

    public Task<User?> GetByIdAsync(Guid id)
        => _db.Users.FirstOrDefaultAsync(x => x.Id == id);

    public async Task AddAsync(User user)
        => await _db.Users.AddAsync(user);

    public Task<int> SaveChangesAsync()
        => _db.SaveChangesAsync();
}
