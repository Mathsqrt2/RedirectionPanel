import { IsDateString, IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";

export class FindMultipleElementsDto {

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10000)
    public maxCount?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    public offset?: number;

    @IsOptional()
    @IsDateString()
    public minDate?: string;

    @IsOptional()
    @IsDateString()
    public maxDate?: string;

}