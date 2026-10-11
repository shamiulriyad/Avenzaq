using Backend.Models.Entities;

namespace Backend.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task AddAsync(User user);
    Task<int> SaveChangesAsync();
}
