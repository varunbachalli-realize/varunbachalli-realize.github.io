SortingTypes = 
    // this enum is created to restrict the changes to sorting types to one place.
    // DON'T change the numbers for these names..
    // string comparisons are really really hard to track and source for all kinds of bugs.
    // if you want to remove or add another sorting category.
    // Give it a unique number.
{
    PriceLowToHigh : 100,
    PriceHighToLow: 200,
    SizeLargeToSmall : 300,
    SizeSmallToLarge : 400,
    SoonestDelivery : 500,
    AToZ : 600,
    ZToA : 700,
    Newest : 800,
    MostPopular : 900,
    Suggested : 0 // no sorting at all.
};