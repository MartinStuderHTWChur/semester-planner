"use strict";

// make adjustments in here %<--------------------
var nr_weeks = 14;
// d: description
// w: weight
var topics = [
{d:"Topic 1",  w:1.33},
{d:"Topic 2",  w:1.33},
{d:"Topic 3",  w:3},
{d:"Topic 4",  w:1.33},
{d:"Topic 5",  w:1},
{d:"Topic 6",  w:1},
{d:"Topic 7",  w:3},
{d:"Topic 8",  w:2},
{d:"Topic 9",  w:3},
{d:"Topic 10", w:4},
{d:"Topic 11", w:6},
{d:"Topic 12", w:1},
{d:"Topic 13", w:3},
{d:"Topic 14", w:2},
{d:"Topic 15", w:2},
{d:"Topic 16", w:1.5},
{d:"Topic 17", w:4.16},
{d:"Topic 18", w:3},
{d:"Topic 19", w:2.33},
{d:"Topic 20", w:1.66},
{d:"Topic 21", w:3},
{d:"Topic 22", w:0.66},
{d:"Topic 23", w:0.66},
{d:"Topic 24", w:1},
{d:"Topic 25", w:3},
{d:"Topic 26", w:3},
{d:"Topic 27", w:1}
];
var best_err = Infinity; // decrease this value to make the calculation slightly faster but risk finding a solution entirely
// make adjustments in here %<--------------------
var best_plan;
var sum_weights = 0;
for (var i=0; i<topics.length; i++) {
	sum_weights += topics[i].w;
}
var mean_topic_weight = sum_weights / topics.length;
var mean_weekly_load = sum_weights / nr_weeks;
function prettyprint() {
	if (typeof best_plan == "undefined") {
		console.log("No solution was found. :-( Try increasing the initial value of 'best_err'");
		return;
	}
	var topics_index = 0;
	console.log("==========================================================");
	for (var week=1; week<=nr_weeks; week++) {
		var todays_topic = "";
		var todays_weight = 0;
		while(topics_index < topics.length) {
			if (best_plan[topics_index]==week-1) {
				todays_topic  += topics[topics_index].d + ", ";
				todays_weight += topics[topics_index].w;
			} else {
				break;
			}
			topics_index++;
		}
		console.log("Week " + week + ": " + todays_topic + " (Weight: " + todays_weight + ")");
	}
	console.log("==========================================================");
	console.log("Mean weekly load = " + mean_weekly_load);
	console.log("Mean topic weight = " + mean_topic_weight);
}
// compute an error value for plans
function evaluate(plan, max_complete_week) {
	var weekly_loads = new Array(nr_weeks);
	// initialize weekly_loads;
	for (var week=0; week<nr_weeks; week++) {
		weekly_loads[week] = 0;
	}
	// sum weight for each week (by iterating over plan)
	for (var topic=0; topic<plan.length; topic++) {
		weekly_loads[plan[topic]] += topics[topic].w;
	}
	
	var err = 0;
	for (var week=0; week<=max_complete_week; week++) {
		err += Math.pow(Math.max(0,weekly_loads[week]-mean_weekly_load),2); // minimum sum of squared overweights
		//err += Math.pow(weekly_loads[week]-mean_weekly_load,2); // least squared error
		//err += Math.abs(weekly_loads[week]-mean_weekly_load); // least error
		//err += Math.max(0,weekly_loads[week]-mean_weekly_load); // minimum sum overweights
	}
	return err;
}
// compute a lower bound error value for incomplete plans
function pre_evaluate(plan) {
	var max_week = plan[plan.length-1]; // plan is monotonically increasing
	if (max_week === 0) {
		// at this stage we can't know/return a lower bound
		return NaN;
	}
	// to calculate errors of partial plans correctly we must be sure that each considered week has got ALL topics assigned
	// therefore we dismiss the last week, since more topics may be assigned to this week in deeper recursion levels of make_plan()
	var max_complete_week = max_week-1;
	
	return evaluate(plan, max_complete_week);
}
// having a custom function to clone an array speeds things up considerably
function clone_array(old) {
	var thenew = new Array(old.length);
	for (var i=0; i<old.length; i++) {
		thenew[i] = old[i];
	}
	return thenew;
}
// topic: index-number (zero-based) of the highest occurring topic 
// min_week: the minimum week number (zero-based) that should be considered for the next entry in plan
// plan: index is topic, value[index] is week
function make_plan(topic, min_week, plan) {
	var err;
	//recursion not finished, plan is incomplete
	if (topic < topics.length-1) {
		err = pre_evaluate(plan);
		// not entering the recursion when things already look bad makes things super fast (thanks Beat)
		if (err < best_err|| isNaN(err)) {
			var newplan = clone_array(plan);
			newplan.push(0); // create dummy entry at the highest+1 array index
			for (var i=min_week; i<=nr_weeks-1; i++) {
				newplan[topic+1] = i;
				make_plan(topic+1, i, newplan);
			}
		}
	// finish recursion, plan is complete
	} else {
		var max_complete_week = nr_weeks-1; // error calculcation must iterate over all weeks, even if they are not contained in the plan
		err = evaluate(plan, max_complete_week);
		if (err < best_err) {
			best_err = err;
			best_plan = plan;
			console.log("Found better plan: " + plan + " with error " + err);
		}
	}
}
console.log("Going to start calculation...");
var t0 = performance.now();
make_plan(0, 0, [0]); // start recursion
var t1 = performance.now();
console.log("Calculation finished. Took " + (t1-t0)/1000 + " seconds.");
prettyprint();