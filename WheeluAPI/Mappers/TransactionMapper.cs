using WheeluAPI.DTO.Transaction;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class TransactionMapper(CourseMapper courseMapper)
{
    public ShortTransactionDTO GetShortDTO(Transaction source)
    {
        return new ShortTransactionDTO
        {
            Id = source.Id.ToString(),
            State = source.State.ToString(),
            ItemCount = source.Items.Count,
            Course = courseMapper.GetShortDTO(source.Course),
            TotalAmount = source.TotalAmount,
            Registered = source.Registered,
            Completed = source.Completed,
            LastUpdate = source.LastUpdate,
            TPayTransactionID = source.TPayTransactionID,
        };
    }

    public List<ShortTransactionDTO> MapToShortDTO(List<Transaction> source)
    {
        return source.Select(GetShortDTO).ToList();
    }

    public TransactionDTO GetDTO(Transaction source)
    {
        return new TransactionDTO
        {
            Id = source.Id.ToString(),
            State = source.State.ToString(),
            ItemCount = source.Items.Count,
            Course = courseMapper.GetShortDTO(source.Course),
            TotalAmount = source.TotalAmount,
            Registered = source.Registered,
            Completed = source.Completed,
            LastUpdate = source.LastUpdate,
            TPayTransactionID = source.TPayTransactionID,
            TPayPaymentUrl = source.TPayPaymentUrl,
            Items = source
                .Items.Select(i => new TransactionItemDTO
                {
                    Id = i.Id,
                    Type = i.Type.ToString(),
                    Name = i.Name,
                    Quantity = i.Quantity,
                    Total = i.Total,
                    RelatedId = i.RelatedId,
                })
                .ToList(),
        };
    }

    public List<TransactionDTO> MapToDTO(List<Transaction> source)
    {
        return source.Select(GetDTO).ToList();
    }
}
