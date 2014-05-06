Physics.js


State object. Replaces tempstate. //DOES NOT REQUIRE THAT ALL OF THESE BE INITIALIZED.
		this.pos
		this.vel
		this.accel
		//this.accelPrime				//vec2 rate of change of accel
		//this.accelDPrime				//vec2 rate of change of rate of change of accel. Dunno if needed.
		this.time
		this.radius

function PlayerModel(time, radius, ..., pos, vel, accel, accelPrime, accelDPrime) {
	State.apply(this, [time, radius, pos, vel, accel, accelPrime, accelDPrime]);
	
	this.updateToState = function (state) {
		if (!(state.time && state.radius && state.pos && state.vel && state.accel)) {
			console.log("Missing fields in state.");
			console.log("time: ", state.time);
			console.log("radius: ", state.radius);
			console.log("pos: ", state.pos);
			console.log("vel: ", state.vel);
			console.log("accel: ", state.accel);
			console.log("time: ", state.time);
			console.log("time: ", state.time);
			throw "Missing fields in state.";
		}
	}
}
PlayerModel.prototype = new State();
PlayerModel.prototype.constructor = PlayerModel;
PlayerModel.prototype.method = function () {
}


StepResult object
		



PhysEng
	
	eventHeap
	predictedEventHeap
	
	
	update(targetTime, newEvents) {
		add newEvents to eventHeap
		
		do
			tempState := attemptStep(goalDeltaTime);
			
			if tempState has new events
				add tempStates events to eventHeap
			
			alter current state to reflect tempState
			
			pop currentEvent(s?) and run its handler.	//case testing verify from the popped events time that this is the time gamestate resulted in.
		while currentEvent isnt a renderEvent
		
	}
		
		
		
	attemptStep(goalDeltaTime) {
		tempState = stepAt(goalDeltaTime);
		var stepCount = 1;
		while player.velocity.multf(goalDeltaTime / stepCount) > MAX_MOVE_DISTANCE
			stepCount *= 2;
		
		
		return endstate at goalDeltaTime, OR state when new event(s) were discovered
	}
	
	
	stepAt(deltaTime) {				// the universal step-to function. returns the position if 
		doshit
	}
	
	
	// UPDATES THE ACCELS AND SHIT IN THE 
	updateVecs(inputState) {
		// EXTRACTED FROM ACCELSTATE OBJECT. Updates the vectors in the PlayerModel. (accel, accelPrime, and accelDPrime
	}