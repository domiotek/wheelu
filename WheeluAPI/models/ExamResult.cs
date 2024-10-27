using System.Reflection;
using Newtonsoft.Json;

namespace WheeluAPI.Models;

public enum ExamCriteriumState
{
    FailedOnce,
    FailedTwice,
    Passed,
}

public interface IExamCriterium
{
    ExamCriteriumState State { get; set; }

    List<CourseCategoryType> HiddenIn { get; set; }
}

public class ExamCriterium : IExamCriterium
{
    public ExamCriteriumState State { get; set; } = ExamCriteriumState.Passed;

    public List<CourseCategoryType> HiddenIn { get; set; } = [];
}

public class LightVehicleExamCriterium : IExamCriterium
{
    public ExamCriteriumState State { get; set; } = ExamCriteriumState.Passed;

    public List<CourseCategoryType> HiddenIn { get; set; } =
        [
            CourseCategoryType.B,
            CourseCategoryType.B1,
            CourseCategoryType.C,
            CourseCategoryType.C1,
            CourseCategoryType.D,
            CourseCategoryType.D1,
            CourseCategoryType.T,
        ];
}

public class ManeuverCriteria
{
    public IExamCriterium PreparingVehicle { get; set; } = new ExamCriterium();

    public IExamCriterium DrivingStraight { get; set; } = new ExamCriterium();

    public IExamCriterium DiagonalParking { get; set; } = new ExamCriterium();

    public IExamCriterium PerpendicularParking { get; set; } = new ExamCriterium();

    public IExamCriterium ParallelParking { get; set; } = new ExamCriterium();

    public IExamCriterium StartingUpHill { get; set; } = new ExamCriterium();

    public IExamCriterium SlowSlalom { get; set; } = new LightVehicleExamCriterium();

    public IExamCriterium FastSlalom { get; set; } = new LightVehicleExamCriterium();

    public IExamCriterium ObstacleBypassing { get; set; } = new LightVehicleExamCriterium();

    public IExamCriterium EightCurve { get; set; } = new LightVehicleExamCriterium();

    [JsonIgnore]
    [System.Text.Json.Serialization.JsonIgnore]
    public int PassedItems
    {
        get
        {
            return GetType()
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(prop => typeof(IExamCriterium).IsAssignableFrom(prop.PropertyType))
                .Select(prop =>
                {
                    return prop.GetValue(this) as IExamCriterium;
                })
                .Count(x => x?.State == ExamCriteriumState.Passed);
        }
    }

    [JsonIgnore]
    [System.Text.Json.Serialization.JsonIgnore]
    public int TotalItems
    {
        get
        {
            return GetType()
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Count(prop => typeof(IExamCriterium).IsAssignableFrom(prop.PropertyType));
        }
    }
}

public class DrivingCriteria
{
    public IExamCriterium JoiningTraffic { get; set; } = new ExamCriterium();

    public IExamCriterium Driving2Way1Road { get; set; } = new ExamCriterium();

    public IExamCriterium Driving2Way2Road { get; set; } = new ExamCriterium();

    public IExamCriterium Driving1Way { get; set; } = new ExamCriterium();

    public IExamCriterium EqualJunction { get; set; } = new ExamCriterium();

    public IExamCriterium SignedJunction { get; set; } = new ExamCriterium();

    public IExamCriterium LightedJunction { get; set; } = new ExamCriterium();

    public IExamCriterium RoundaboutJunction { get; set; } = new ExamCriterium();

    public IExamCriterium TwoLevelJunction { get; set; } = new ExamCriterium();

    public IExamCriterium DrivingThroughCrossing { get; set; } = new ExamCriterium();

    public IExamCriterium TurningAround { get; set; } = new ExamCriterium();

    public IExamCriterium TramOrTrainTracksCrossing { get; set; } = new ExamCriterium();

    public IExamCriterium TunnelDriving { get; set; } = new ExamCriterium();

    public IExamCriterium DrivingNearPublicTransportStop { get; set; } = new ExamCriterium();

    public IExamCriterium Overtaking { get; set; } = new ExamCriterium();

    public IExamCriterium Bypassing { get; set; } = new ExamCriterium();

    public IExamCriterium PassingBy { get; set; } = new ExamCriterium();

    public IExamCriterium LaneChanging { get; set; } = new ExamCriterium();

    public IExamCriterium TurningRight { get; set; } = new ExamCriterium();

    public IExamCriterium TurningLeft { get; set; } = new ExamCriterium();

    public IExamCriterium TurningAroundOnJunction { get; set; } = new ExamCriterium();

    public IExamCriterium StoppingAtDestination { get; set; } = new ExamCriterium();

    public IExamCriterium EmergencyStop { get; set; } = new ExamCriterium();

    public IExamCriterium Uncoupling { get; set; } = new ExamCriterium();

    public IExamCriterium GearShifting { get; set; } = new ExamCriterium();

    public IExamCriterium EngineBraking { get; set; } = new ExamCriterium();

    public IExamCriterium DrivingOverSpeedLimit { get; set; } = new ExamCriterium();

    public IExamCriterium HorizontalSignObeying { get; set; } = new ExamCriterium();

    public IExamCriterium VerticalSignObeying { get; set; } = new ExamCriterium();

    public IExamCriterium LightSignObeying { get; set; } = new ExamCriterium();

    public IExamCriterium PersonSignObeying { get; set; } = new ExamCriterium();

    public IExamCriterium BehaviorTowardsOthers { get; set; } = new ExamCriterium();

    public IExamCriterium OverallDriving { get; set; } = new ExamCriterium();

    [JsonIgnore]
    [System.Text.Json.Serialization.JsonIgnore]
    public int PassedItems
    {
        get
        {
            return GetType()
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(prop => typeof(IExamCriterium).IsAssignableFrom(prop.PropertyType))
                .Select(prop =>
                {
                    return prop.GetValue(this) as IExamCriterium;
                })
                .Count(x => x?.State != ExamCriteriumState.FailedTwice);
        }
    }

    [JsonIgnore]
    [System.Text.Json.Serialization.JsonIgnore]
    public int TotalItems
    {
        get
        {
            return GetType()
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Count(prop => typeof(IExamCriterium).IsAssignableFrom(prop.PropertyType));
        }
    }
}

public class ExamResult
{
    public ManeuverCriteria ManeuverCriteria { get; set; } = new();

    public DrivingCriteria DrivingCriteria { get; set; } = new();

    [JsonIgnore]
    [System.Text.Json.Serialization.JsonIgnore]
    public int PassedItems
    {
        get { return ManeuverCriteria.PassedItems + DrivingCriteria.PassedItems; }
    }

    [JsonIgnore]
    [System.Text.Json.Serialization.JsonIgnore]
    public int TotalItems
    {
        get { return ManeuverCriteria.TotalItems + DrivingCriteria.TotalItems; }
    }
}
