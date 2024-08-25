using System.Transactions;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Location;
using WheeluAPI.DTO.SchoolApplication;
using WheeluAPI.helpers;
using WheeluAPI.models;

namespace WheeluAPI.Services;

public class LocationService(ApplicationDbContext dbContext): ILocationService {

	public ValueTask<State?> GetStateAsync(int ID) {
		return dbContext.States.FindAsync(ID);
	}

	public Task<State?> GetStateAsync(string name) {
		return dbContext.States.Where(s=>s.Name == name).FirstOrDefaultAsync();
	}

	public async Task<ZipCode?> CreateZipCode(City city, string name) {
		var zipCode = new ZipCode {
			Name = name,
			City = city
		};

		dbContext.ZipCodes.Add(zipCode);

		var written = await dbContext.SaveChangesAsync();

		return written>0?zipCode:null;
	}

	public Task<ZipCode?> GetZipCode(string name) {
		return dbContext.ZipCodes.Where(z=>z.Name == name).FirstOrDefaultAsync();
	}

	public async Task<City?> CreateCity(State state, string name) {
		var newCity = new City {
			Name = name,
			State = state
		};

		dbContext.Cities.Add(newCity);

		var written = await dbContext.SaveChangesAsync();

		return written>0?newCity:null;
	}

	public Task<City?> GetCity(string name, string state) {
		return dbContext.Cities.Include(c=>c.State).Where(c=>c.State.Name==state).Where(c=>c.Name==name).SingleOrDefaultAsync();
	}

	public async Task<List<City>> ResolveNearbyCities(List<NearbyCityDefinition> items) {
		List<City> resultList = [];

		foreach(var item in items) {
			var existingCity = await dbContext.Cities.Include(c=>c.State).Where(c=>c.Id == item.Id).SingleOrDefaultAsync();

			if(existingCity != null) {
				resultList.Add(existingCity);
				continue;
			}

			var state = await GetStateAsync(item.State);

			if(state==null || item.Name==null) continue;

			var newCity = new City {
				Name = item.Name,
				State = state
			};

			dbContext.Cities.Add(newCity);
			resultList.Add(newCity);
		}

		var written = await dbContext.SaveChangesAsync();

		if(written > 0) return resultList;

		return [];
	}

	public async Task<Address?> CreateAddress(CreateAddressData data) {
		var address = new Address {
			Street = data.Street,
			BuildingNumber = data.BuildingNumber,
			SubBuildingNumber = data.SubBuildingNumber,
			ZipCode = data.ZipCode
		};

		dbContext.Addresses.Add(address);
		var written = await dbContext.SaveChangesAsync();

		return written > 0? address : null;
	}

	public async Task<ComposeAddressResult> ComposeAddress(ComposeAddressData data) {

		using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled)) {
			var state = await GetStateAsync(data.State);

			if(state==null) return new ComposeAddressResult {ErrorCode = ComposeAddressErrCodes.StateNotFound};

			var city = state.Cities.Find(c=>c.Name==data.City) ?? await CreateCity(state, data.City);

			if(city==null) return new ComposeAddressResult {ErrorCode = ComposeAddressErrCodes.DbError, Details = [$"Couldn't create '{data.City}' city."]};

			var zipCode = city.ZipCodes.Find(z=>z.Name==data.ZipCode) ?? await CreateZipCode(city, data.ZipCode);

			if(zipCode==null) return new ComposeAddressResult {ErrorCode = ComposeAddressErrCodes.DbError, Details = [$"Couldn't create '{data.ZipCode}' zip code."]};

			var addressData = new CreateAddressData {
				Street = data.Street,
				BuildingNumber = data.BuildingNumber,
				SubBuildingNumber = data.SubBuildingNumber,
				ZipCode = zipCode
			};

			var address = await CreateAddress(addressData);

			if(address==null) return new ComposeAddressResult {ErrorCode = ComposeAddressErrCodes.DbError, Details = [$"Couldn't create address."]};

			scope.Complete();
			return new ComposeAddressResult {IsSuccess = true, Address = address};
		}
	}
}


public interface ILocationService {
	ValueTask<State?> GetStateAsync(int ID);
	Task<State?> GetStateAsync(string name);
	Task<ZipCode?> CreateZipCode(City city, string name);
	Task<ZipCode?> GetZipCode(string name);
	Task<City?> CreateCity(State state, string name);
	Task<City?> GetCity(string name, string state);
	Task<Address?> CreateAddress(CreateAddressData data);
	Task<ComposeAddressResult> ComposeAddress(ComposeAddressData data);
	Task<List<City>> ResolveNearbyCities(List<NearbyCityDefinition> items);
}