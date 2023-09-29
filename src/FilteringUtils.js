function roundValue(value){
    return parseInt(Math.round(value / 10)) * 10;
}


function FindStepValue(minValue, maxValue, count)
{
    let step = (maxValue - minValue) / count;

    let step_int = parseInt(step);
    let remainder = step_int;
    let jump = 0;

    while (true)
    {
        jump += 1;
        remainder = parseInt(step_int / Math.pow(10, jump));
        if (remainder<=0)
        {
            break;
        }
        console.log(remainder);
    }

    var step10s = parseInt(Math.pow(10, jump - 1));
    var trueStep = parseInt(Math.round(step / step10s)) * step10s;
    return trueStep;
}

function getRanges(Min,Max){
    let min = roundValue(Min);
    let max = roundValue(Max);
    let roughCount = 5; // won't get exact 5.. might be less.

    let step = FindStepValue(min, max, roughCount);
    var stepper = min == 0? min + step : min ;
    let ranges = [[0, stepper]];
    
    while (stepper + step <= max && ranges.length < roughCount - 1)
    {
        ranges.push([stepper, stepper + step]);
        stepper = stepper + step;
    }

    ranges.push([stepper, Number.MaxValue]);
    return ranges;
}