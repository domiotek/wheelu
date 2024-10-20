namespace WheeluAPI.Models;

public enum SkillLevel
{
    None,
    Medium,
    Good,
    Excelent,
}

public class GeneralSkills
{
    public SkillLevel PreparingVehicle { get; set; }

    public SkillLevel ClutchAndShifting { get; set; }

    public SkillLevel ComponentKnowledge { get; set; }

    public SkillLevel LightsHandling { get; set; }

    public SkillLevel HarshConditionsDriving { get; set; }
}

public class GeneralDrivingSkills
{
    public SkillLevel RoundaboutCrossing { get; set; }

    public SkillLevel LaneChanging { get; set; }

    public SkillLevel ClassicIntersection { get; set; }

    public SkillLevel GivingWayPedestrians { get; set; }

    public SkillLevel GivingWayVehicles { get; set; }

    public SkillLevel BicycleOvertaking { get; set; }

    public SkillLevel VehicleOvertaking { get; set; }

    public SkillLevel DynamicDriving { get; set; }

    public SkillLevel SpeedAdjusting { get; set; }
}

public class HighwaySkills
{
    public SkillLevel Overtaking { get; set; }

    public SkillLevel LaneChanging { get; set; }

    public SkillLevel SpeedAdjusting { get; set; }
}

public class ManeuverSkills
{
    public SkillLevel PerpendicularParking { get; set; }

    public SkillLevel ParallelParking { get; set; }

    public SkillLevel DiagonalParking { get; set; }

    public SkillLevel StartingUpTheHill { get; set; }

    public SkillLevel StoppingAtDestination { get; set; }

    public SkillLevel TurningAroundOnIntersection { get; set; }

    public SkillLevel TurningAroundUsingInfrastructure { get; set; }
}

public class CourseProgress
{
    public GeneralSkills GeneralSkills { get; set; } = new();

    public GeneralDrivingSkills DevelopedAreaSkills { get; set; } = new();

    public GeneralDrivingSkills UndevelopedAreaSkills { get; set; } = new();

    public HighwaySkills HighwaySkills { get; set; } = new();

    public ManeuverSkills ManeuverSkills { get; set; } = new();
}
