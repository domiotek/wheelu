using WheeluAPI.DTO;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Image;
using WheeluAPI.helpers;
using WheeluAPI.models;

namespace WheeluAPI.Services;

public class ImageService(ApplicationDbContext dbContext, IConfiguration config)
    : BaseService,
        IImageService
{
    public static readonly List<string> AllowedExtensions = ["png", "jpg", "jpeg"];

    public static readonly double MaxFileSizeInMB = 5;

    public ValueTask<Image?> GetImage(int imageId)
    {
        return dbContext.Images.FindAsync(imageId);
    }

    public async Task<SaveImageResult> SaveImage(IFormFile file)
    {
        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "static");

        var ext = file.FileName.Split(".").LastOrDefault();

        if (ext == null || !AllowedExtensions.Contains(ext))
            return new SaveImageResult { ErrorCode = SaveImageErrors.ExtNotAllowed };

        var fileSizeInMB = file.Length / (1024.0 * 1024.0);

        if (fileSizeInMB > MaxFileSizeInMB)
            return new SaveImageResult { ErrorCode = SaveImageErrors.FileTooLarge };

        var fileName = Guid.NewGuid().ToString() + "." + ext;
        var filePath = Path.Combine(uploadPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var image = new Image { FileName = fileName, UploadDate = DateTime.UtcNow };

        dbContext.Images.Add(image);
        if (await dbContext.SaveChangesAsync() == 0)
        {
            File.Delete(filePath);
            return new SaveImageResult { ErrorCode = SaveImageErrors.DbError };
        }

        return new SaveImageResult { IsSuccess = true, Image = image };
    }

    public bool DeleteImage(string fileName)
    {
        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "static");

        var filePath = Path.Combine(uploadPath, fileName);

        try
        {
            if (File.Exists(filePath))
                File.Delete(filePath);
        }
        catch (Exception)
        {
            return false;
        }

        return true;
    }

    public ImageResponse GetDTO(Image source)
    {
        var rootURL = config["HostURL"];

        return new ImageResponse
        {
            Id = source.Id,
            Url = $"{rootURL}/static/{source.FileName}",
            UploadDate = source.UploadDate,
        };
    }
}

public interface IImageService
{
    ValueTask<Image?> GetImage(int imageId);

    Task<SaveImageResult> SaveImage(IFormFile file);

    bool DeleteImage(string fileName);

    ImageResponse GetDTO(Image source);
}
