using WheeluAPI.Models;

namespace WheeluAPI.models;

public enum SchoolUpdateMode
{
    Owner,
    Administrator,
}

public class School
{
    public int Id { get; set; }

    public required bool Hidden { get; set; }

    public bool Blocked { get; set; } = false;

    public required string Name { get; set; }

    public string? Description { get; set; }

    public required string NIP { get; set; }

    public virtual required User Owner { get; set; }

    public virtual required Address Address { get; set; }

    public required DateOnly Established { get; set; }

    public required DateTime Joined { get; set; }

    public required string PhoneNumber { get; set; }

    public virtual required Image CoverImage { get; set; }

    public virtual required List<City> NearbyCities { get; set; }

    public virtual required List<CourseOffer> CourseOffers { get; set; }
}
