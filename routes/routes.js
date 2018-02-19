var User = require('../models/user');
var Habit = require('../models/habit');

module.exports = (app) => {

	// middleware function to check for logged-in users
	var sessionChecker = (req, res, next) => {
	  if (!req.session.user) {
		res.redirect('/login');
	  } else {
		next();
	  }
	};

    app.get('/login', function (req, res, next) {
        if (req.session.user) {
            res.redirect("/");
        } else {
            res.render('login', {
                title: "Quirk - Login",
            });
        }
    });

    app.get('/', sessionChecker, function (req, res, next) {
        var LoggedInUser = req.session.user;

        User.findOne({ '_id': LoggedInUser }, function (err, user) {
			Habit.find({'owner': LoggedInUser}, function(err, habits){
				res.render('dashboard', {
					title: "Quirk - Dashboard",
					user: user,
					habits: habits
				});
			});
        });
  	});

	app.get('/stats/:id', sessionChecker, function (req, res, next) {
        var LoggedInUser = req.session.user;
		var habit_id = req.params.id;

        User.findOne({ '_id': LoggedInUser }, function (err, user) {
			Habit.findOne({'_id': habit_id}, function(err, habit){
				res.render('statistics', {
					title: "Quirk - Statistics",
					user: user,
					habit: habit
				});
			});
        });
  	});

  app.post('/addhabit', function(req, res, next){
    var newHabit = {
      owner: req.session.user,
      habit_name: req.body.habitName,
      habit_desc: req.body.habitDesc,
      weekly_goal: req.body.weeklyGoal,
	  num_of_weeks: req.body.numOfWeeks,
	  colour: req.body.colour
    }

	var habit = new Habit(newHabit);
	habit.save()
	.then((savedHabit) => {
      res.redirect('/');
    }).catch((error) => {
      console.log(error);
      res.redirect('/');
    });
  });

  app.get('/gethabits', function(req,res){
	  Habit.find({owner: req.session.user}, function(err, habits){
		  res.json(habits);
	  });
  });

  app.post('/updatehabit', function(req,res){
	  Habit.findOne({_id: req.body.habit_id}, function(err, habit){
		  if(habit.datesCompleted.includes(req.body.date)){ //if it already exists in the array => remove it =>(else) add it
			  var index = habit.datesCompleted.indexOf(req.body.date);
			  habit.datesFailed.push(req.body.date);
			  habit.datesCompleted.splice(index);
			  habit.save();
			  res.send("failed");
		  } else if (habit.datesFailed.includes(req.body.date)) {
			  var index = habit.datesFailed.indexOf(req.body.date);
			  habit.datesFailed.splice(index);
			  habit.save();
			  res.send("removed");
		  } else {
			  habit.datesCompleted.push(req.body.date);
			  habit.save();
			  res.send("completed");
		  }
	  });
  });

  function isInArray(value, array) {
	  return array.indexOf(value) > -1;
  }

}
