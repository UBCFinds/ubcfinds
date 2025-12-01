# MVP Removed Features

With our final version of our minimally viable product, we have decided to forgo some of the features we originally planned for.

1. We planned for a feature that would highlight closest utilities of each checked category for a certain point - and this "certain point" would be the location that the user clicks on the map. For example, on our map, if the user were to click on a road near the Orchard Commons residence building, the program would highlight the nearest utilities of each checked category to that coordinate.
We found out that this implementation is pretty simple to do on the backend, but implementing on the frontend is much more complex. In addition, when using the service on the webpage as a consumer, it's a feature that wouldn't actually be super helpful since we have a working current-location feature. 

2. We have decided to change the utility menu (very similar to the previous change). We originally wanted a "nearby utilities" list, but we decided that we would rather have a comprehensive list of all individual utilities so that users can scroll through and find utilities by name. By only limiting that menu to a few nearby utilities, it defeats the purpose of a list that users can scroll through.

3. We have decided not to implement a button on the map that refocuses the screen on the user's current location. There are two main reasons for this decision.
- The location fetching service's functionality is dependent on whether or not the user allows the webpage to collect their location. This means that our webpage will ask for this permission and, unless the user selects "Yes", it will be a useless button. In too many cases, location features won't even be active and as such, implementing a button like that seemed less than worthwhile.
- We ran out of time.

# Known Bugs

There are also a few bugs that we are aware of, but don't have the time to fix. 

1. There is an SQL error involved with our google maps API.

2. There is a visual bug on the utility detail menu. Below is a photo of what the menu looks like for a utility with a short building name and location description. 
![alt text](image-10.png)
    
    Below is a photo of what the menu looks like for a utility with a very long building name/location description.
![alt text](image-9.png)

    As you can see (or rather, can't see), the little pin icon next to the building name is barely visible when the text is on the longer side. This bug became evident after we implemented all of our individual utilities and performed our manual frontend testing. In any case, we found this too late and are unable to fix it in time.