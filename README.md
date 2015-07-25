# The Legendary Quest
The Legendary Quest is a tool to plan your legendary weapon in [Guild Wars 2](www.guildwars2.com).

It provides information both about the crafting process, in the form of a crafting tree,
and about the costs, giving you both a list of the items still needed and a breakdown of the
different currencies you need to get them.

## How to use it
You can directly head to [the website](redglow.github.io/TheLegendaryQuest/) in order to use it.

There you can choose your legendary, whether you want trading post costs to be computed as "buy now" or "buy order",
and optionally put an API key in order to access your bank content, and take it into consideration
for the cost computation.

After the program has finished querying the ANet services, you will get your result
below.

## Technical aspects
If you want to contribute, you may be interested in some technical aspects.

The program is completely contained in a single web page. Every computation is client-side, and takes advantage
of the [Guild Wars 2 API](wiki.guildwars2.com/wiki/API:2) to query for various data (recipes, bank/material
contents, inventory contents, ...).

The build infrastructure is based on [npm](https://www.npmjs.com/) and [Grunt](http://gruntjs.com/).

### Setup a development environment

In order to setup a functional development environment, the following steps are needed:

* Produce your local branch of TheLegendaryQuest repository (through the GitHub program or any other git tool)
* Download and install npm
* Run `npm install` (this installs grunt and the various libraries needed)
* Run `./node_modules/.bin/grunt develop` (for *unix systems) or `.\node_modules\.bin\grunt develop` (for windows systems)
* Now run a webserver that serves the contents of the development directory;  I use the super-easy [Mongoose](https://code.google.com/p/mongoose/)
* Go to `<http root address>/origin-index.html`
* Start making changes and improvements
* When you're happy with that, produce a pull request and send it to my repository, so that it can be integrated!

## Changelog

### [0.2.0](https://www.reddit.com/r/Guildwars2/comments/3efvdt/the_legendary_quest_v_020/)

* All the legendaries are included ([#7](https://github.com/RedGlow/TheLegendaryQuest/issues/7))
* Not only the bank, but character inventories are inspected too, if the API key has the "characters" scope ([#5](https://github.com/RedGlow/TheLegendaryQuest/issues/5))
* The whole interface is displayed in English, regardless of your browser settings (no more German or French item names) ([#4](https://github.com/RedGlow/TheLegendaryQuest/issues/4))
* Slightly improved mobile support ([#8](https://github.com/RedGlow/TheLegendaryQuest/issues/8))
* Recipe costs are now included ([#13](https://github.com/RedGlow/TheLegendaryQuest/issues/13)) - it's not possible (yet) to know the recipe unlocks on your characters, so the recipe costs are always included
* The costs section computation algorithm has been fixed, and should now report the correct amounts (and total costs) (thanks [/u/BaelMadeMeMakeThis](https://www.reddit.com/user/BaelMadeMeMakeThis)!)
* Other minor changes are:
  * Removed console.* debug messages that could mess up some browsers.
  * Changed the TP labels
  * Moved some JS libraries under Grunt management

### [0.1.0](https://www.reddit.com/r/Guildwars2/comments/3d6aic/the_legendary_quest_a_legendary_online_tracker/)

* Initial Release
