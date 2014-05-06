Physics.js





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