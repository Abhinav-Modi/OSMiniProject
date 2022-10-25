var readyQueue = [];

var timeQuanta;
var stop_flag = false;

function readyQueueInit() {
	for (i = 0; i < processes.length; i++) {
		let copiedProcess = Object.assign({}, processes[i]);
		readyQueue[i] = copiedProcess;
	}
}
//formula1
function calculateTimeQuanta() {
	let sum, temp, max;
	if (readyQueue.length != 0) {
		max = Number.MIN_VALUE;
		sum = 0;
		for (let i = 0; i < readyQueue.length; i++) {
			temp = readyQueue[i].burst_time;
			sum += temp;
			if (temp > max) max = temp;
		}
		timeQuanta = Math.sqrt(((1.0 * sum) / readyQueue.length) * max);
	} else {
		timeQuanta = 0;
	}
}

function calculateBurstTimePriority() {
	let duplicate = [];
	let flag = [];
	for (i in readyQueue) {
		duplicate[i] = readyQueue[i].burst_time;
		flag[i] = false;
	}

	duplicate.sort(function (a, b) {
		return a - b;
	});

	for (p in readyQueue) {
		for (d in duplicate) {
			if (readyQueue[p].burst_time === duplicate[d] && !flag[d]) {
				readyQueue[p].burstTimePriority = Number(d) + 1;
				flag[d] = true;
				break;
			}
		}
	}
}

function getProcessById(id) {
	for (p in processes) {
		if (processes[p].id == id) {
			return processes[p];
		}
	}
}

function calculateAvgTime(waitingTime) {
	let avg = 0;
	for (i = 1; i < waitingTime.length; i++) {
		avg += waitingTime[i];
	}
	return avg / (waitingTime.length - 1);
}
var avgWaitingTimeFCFS = 0,
	avgTurnaroundTimeFCFS = 0,
	avgResponseTimeFCFS = 0;
var ganttFCFS = [];
var completionTimeFCFS = 0;

async function FCFS(flag) {
	readyQueueInit(); // initialising queue with process objects as elements
	let p, min;
	let turnAroundFCFS = [];
	let waitingFCFS = [];
	let processQueue = [];
	let time = 0;

	// creating an outer label
	outer: while (readyQueue.length != 0) {
		for (let process in readyQueue) {
			if (readyQueue[process].arrival_time <= time) {
				processQueue.push(readyQueue[process]);
			}
		}
		//process queue is holding all the processes that have arrived
		console.log(processQueue.length);
		// for rendering empty time block
		if (processQueue.length === 0) {
			if (
				ganttFCFS.length > 0 &&
				ganttFCFS[ganttFCFS.length - 1].processId != null
			) {
				ganttFCFS[ganttFCFS.length - 1].endTime = time;
				ganttFCFS.push({
					processId: null,
					startTime: time,
					endTime: time + 1,
				});
			} else if (ganttFCFS.length == 0) {
				ganttFCFS.push({
					processId: null,
					startTime: time,
					endTime: time + 1,
				});
			}
			time++;

			continue outer;
		}

		let vis_block = ""; // for gantt chart block
		min = Number.MAX_VALUE;
		for (let process in processQueue) {
			vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`;
			if (processQueue[process].arrival_time < min) {
				min = processQueue[process];
				p = process;
			}
		}

		prev_time = time;
		time += processQueue[p].burst_time;
		turnAroundFCFS[processQueue[p].id] = time - processQueue[p].arrival_time;
		waitingFCFS[processQueue[p].id] =
			turnAroundFCFS[processQueue[p].id] - processQueue[p].burst_time;

		for (let pro in readyQueue) {
			if (readyQueue[pro].id === processQueue[p].id) readyQueue.splice(pro, 1);
		}

		//adding the new gantt chart block
		if (ganttFCFS.length > 0) {
			ganttFCFS[ganttFCFS.length - 1].endTime = prev_time;
		}
		ganttFCFS.push({
			processId: processQueue[p].id,
			startTime: prev_time,
			endTime: time,
		});
		processQueue.splice(0, processQueue.length); //removing item from process queue after completion
	}
	$(".btn").removeAttr("disabled");
	stop_flag = false;
	completionTimeFCFS = time;
	avgTurnaroundTimeFCFS = calculateAvgTime(turnAroundFCFS);
	avgWaitingTimeFCFS = calculateAvgTime(waitingFCFS);
	avgResponseTimeFCFS = avgWaitingTimeFCFS;
}
var avgWaitingTimeSJFNonPre = 0,
	avgTurnaroundTimeSJFNonPre = 0,
	avgResponseTimeSJFNonPre = 0;
var ganttSJFNonPre = [];
var completionTimeSJF = 0;

async function SJFNonPre(flag) {
	readyQueueInit();
	let min = Number.MAX_VALUE;
	let p;
	let turnAroundSJFNonPre = [];
	let waitingSJFNonPre = [];
	let processQueue = [];
	let time = 0;

	outer: while (readyQueue.length != 0) {
		for (let process in readyQueue) {
			if (readyQueue[process].arrival_time <= time)
				processQueue.push(readyQueue[process]);
		}

		if (processQueue.length === 0) {
			if (
				ganttSJFNonPre.length > 0 &&
				ganttSJFNonPre[ganttSJFNonPre.length - 1].processId != null
			) {
				ganttSJFNonPre[ganttSJFNonPre.length - 1].endTime = time;
				ganttSJFNonPre.push({
					processId: null,
					startTime: time,
					endTime: time + 1,
				});
			} else if (ganttSJFNonPre.length == 0) {
				ganttSJFNonPre.push({
					processId: null,
					startTime: time,
					endTime: time + 1,
				});
			}
			time++;
			continue outer;
		}
		min = Number.MAX_VALUE;
		let vis_block = "";
		for (let process in processQueue) {
			vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`;
			if (processQueue[process].burst_time < min) {
				min = processQueue[process].burst_time;
				p = process;
			}
		}

		prev_time = time;
		time += processQueue[p].burst_time;
		if (ganttSJFNonPre.length > 0)
			ganttSJFNonPre[ganttSJFNonPre.length - 1].endTime = prev_time;
		ganttSJFNonPre.push({
			processId: processQueue[p].id,
			startTime: prev_time,
			endTime: time,
		});
		turnAroundSJFNonPre[processQueue[p].id] =
			time - processQueue[p].arrival_time;
		waitingSJFNonPre[processQueue[p].id] =
			turnAroundSJFNonPre[processQueue[p].id] - processQueue[p].burst_time;
		for (pro in readyQueue) {
			if (readyQueue[pro].id === processQueue[p].id) readyQueue.splice(pro, 1);
		}
		processQueue.splice(0, processQueue.length);
	}
	$(".btn").removeAttr("disabled");
	stop_flag = false;
	completionTimeSJF = time;
	avgTurnaroundTimeSJFNonPre = calculateAvgTime(turnAroundSJFNonPre);
	avgWaitingTimeSJFNonPre = calculateAvgTime(waitingSJFNonPre);
	avgResponseTimeSJFNonPre = avgWaitingTimeSJFNonPre;
}
var avgWaitingTimeSJFPre = 0,
	avgTurnaroundTimeSJFPre = 0,
	avgResponseTimeSJFPre = 0;
var ganttSJFPre = [];
var completionTimeSJFPre = 0;

async function SJFPre(flag) {
	readyQueueInit();
	let min = Number.MAX_VALUE;
	let p;
	let turnAroundSJFPre = [];
	let waitingSJFPre = [];
	let responseSJFPre = [];
	let processQueue = [];
	let completionTime = [];
	let time = 0;

	outer: while (readyQueue.length != 0) {
		for (let process in readyQueue) {
			if (readyQueue[process].arrival_time <= time)
				processQueue.push(readyQueue[process]);
		}

		if (processQueue.length === 0) {
			if (
				ganttSJFPre.length > 0 &&
				ganttSJFPre[ganttSJFPre.length - 1].processId != null
			) {
				ganttSJFPre[ganttSJFPre.length - 1].endTime = time;
				ganttSJFPre.push({
					processId: null,
					startTime: time,
					endTime: time + 1,
				});
			} else if (ganttSJFPre.length == 0) {
				ganttSJFPre.push({
					processId: null,
					startTime: time,
					endTime: time + 1,
				});
			}
			time++;
			continue;
		}
		min = Number.MAX_VALUE;
		let vis_block = "";
		for (let process in processQueue) {
			vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`;
			if (processQueue[process].burst_time < min) {
				min = processQueue[process].burst_time;
				p = process;
			}
		}
		prev_time = time;
		time++;

		if (
			ganttSJFPre.length > 0 &&
			ganttSJFPre[ganttSJFPre.length - 1].processId != processQueue[p].id
		) {
			ganttSJFPre[ganttSJFPre.length - 1].endTime = prev_time;
			ganttSJFPre.push({
				processId: processQueue[p].id,
				startTime: prev_time,
				endTime: time,
			});
		} else if (ganttSJFPre.length == 0) {
			ganttSJFPre.push({
				processId: processQueue[p].id,
				startTime: prev_time,
				endTime: time,
			});
		}
		//comparing shortest burst times
		if (
			processQueue[p].burst_time ===
			getProcessById(processQueue[p].id).burst_time
		) {
			//It means came for the first time

			responseSJFPre[processQueue[p].id] = time - processQueue[p].arrival_time;
		}
		processQueue[p].burst_time--;
		if (processQueue[p].burst_time == 0) {
			completionTime[processQueue[p].id] = time;
			for (let process in readyQueue) {
				if (readyQueue[process].id == processQueue[p].id) {
					readyQueue.splice(process, 1);
				}
			}
		}
		processQueue.splice(p, processQueue.length);
	}
	$(".btn").removeAttr("disabled");
	stop_flag = false;
	for (p in processes) {
		turnAroundSJFPre[processes[p].id] =
			completionTime[processes[p].id] - processes[p].arrival_time;
		waitingSJFPre[processes[p].id] =
			turnAroundSJFPre[processes[p].id] - processes[p].burst_time;
	}
	if (ganttSJFPre.length > 0)
		ganttSJFPre[ganttSJFPre.length - 1].endTime = time;
	completionTimeSJFPre = time;
	avgTurnaroundTimeSJFPre = calculateAvgTime(turnAroundSJFPre);
	avgWaitingTimeSJFPre = calculateAvgTime(waitingSJFPre);
	avgResponseTimeSJFPre = calculateAvgTime(responseSJFPre);
}
var avgWaitingTimePriorityNonPre = 0,
	avgTurnaroundTimePriorityNonPre = 0,
	avgResponseTimePriorityNonPre = 0;
var ganttPriorityNonPre = [];
var completionTimePriority = 0;

async function priorityNonPre(flag) {
	readyQueueInit();
	let min = Number.MAX_VALUE;
	let p;
	let processQueue = [];
	let turnAroundPriorityNonPre = [];
	let waitingPriorityNonPre = [];
	let time = 0;
	outer: while (readyQueue.length != 0) {
		for (let process in readyQueue) {
			if (readyQueue[process].arrival_time <= time) {
				processQueue.push(readyQueue[process]);
			}
		}
		if (processQueue.length === 0) {
			if (
				ganttPriorityNonPre.length > 0 &&
				ganttPriorityNonPre[ganttPriorityNonPre.length - 1].processId != null
			) {
				ganttPriorityNonPre[ganttPriorityNonPre.length - 1].endTime = time;
				ganttPriorityNonPre.push({
					processId: null,
					startTime: time,
					endTime: time + 1,
				});
			} else if (ganttPriorityNonPre.length == 0) {
				ganttPriorityNonPre.push({
					processId: null,
					startTime: time,
					endTime: time + 1,
				});
			}
			time++;
			continue;
		}
		min = Number.MAX_VALUE;
		let vis_block = "";
		for (let process in processQueue) {
			vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`;
			if (processQueue[process].priority < min) {
				min = processQueue[process].priority;
				p = process;
			}
		}

		prev_time = time;
		time += processQueue[p].burst_time;
		if (ganttPriorityNonPre.length > 0)
			ganttPriorityNonPre[ganttPriorityNonPre.length - 1].endTime = prev_time;
		ganttPriorityNonPre.push({
			processId: processQueue[p].id,
			startTime: prev_time,
			endTime: time,
		});
		turnAroundPriorityNonPre[processQueue[p].id] =
			time - processQueue[p].arrival_time;
		waitingPriorityNonPre[processQueue[p].id] =
			turnAroundPriorityNonPre[processQueue[p].id] - processQueue[p].burst_time;
		for (pro in readyQueue) {
			if (readyQueue[pro].id === processQueue[p].id) readyQueue.splice(pro, 1);
		}
		processQueue.splice(0, processQueue.length);
	}
	$(".btn").removeAttr("disabled");
	stop_flag = false;
	completionTimePriority = time;
	avgTurnaroundTimePriorityNonPre = calculateAvgTime(turnAroundPriorityNonPre);
	avgWaitingTimePriorityNonPre = calculateAvgTime(waitingPriorityNonPre);
	avgResponseTimePriorityNonPre = avgWaitingTimePriorityNonPre;
}
var avgWaitingTimePriorityPre = 0,
	avgTurnaroundTimePriorityPre = 0,
	avgResponseTimePriorityPre = 0;
var ganttPriorityPre = [];
var completionTimePriorityPre = 0;

async function priorityPre(flag) {
	readyQueueInit();
	let min = Number.MAX_VALUE;
	let p;
	let turnAroundPriorityPre = [];
	let waitingPriorityPre = [];
	let responsePriorityPre = [];
	let processQueue = [];
	let completionTime = [];
	let time = 0;

	outer: while (readyQueue.length != 0) {
		for (let process in readyQueue) {
			if (readyQueue[process].arrival_time <= time)
				processQueue.push(readyQueue[process]);
		}

		if (processQueue.length == 0) {
			if (
				ganttPriorityPre.length > 0 &&
				ganttPriorityPre[ganttPriorityPre.length - 1].processId != null
			) {
				ganttPriorityPre[ganttPriorityPre.length - 1].endTime = time;
				ganttPriorityPre.push({
					processId: null,
					startTime: time,
					endTime: time + 1,
				});
			} else if (ganttPriorityPre.length == 0) {
				ganttPriorityPre.push({
					processId: null,
					startTime: time,
					endTime: time + 1,
				});
			}
			time++;
			continue outer;
		}
		min = Number.MAX_VALUE;
		let vis_block = "";
		for (let process in processQueue) {
			vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`;
			if (processQueue[process].priority < min) {
				min = processQueue[process].priority;
				p = process;
			}
		}

		prev_time = time;
		time++;
		if (
			ganttPriorityPre.length > 0 &&
			ganttPriorityPre[ganttPriorityPre.length - 1].processId !=
				processQueue[p].id
		) {
			ganttPriorityPre[ganttPriorityPre.length - 1].endTime = prev_time;
			ganttPriorityPre.push({
				processId: processQueue[p].id,
				startTime: prev_time,
				endTime: time,
			});
		} else if (ganttPriorityPre.length == 0) {
			ganttPriorityPre.push({
				processId: processQueue[p].id,
				startTime: prev_time,
				endTime: time,
			});
		}
		if (
			processQueue[p].burst_time ===
			getProcessById(processQueue[p].id).burst_time
		) {
			//It means came for the first time
			responsePriorityPre[processQueue[p].id] =
				prev_time - processQueue[p].arrival_time;
		}
		let index;
		for (pro in readyQueue) {
			if (readyQueue[pro].id === processQueue[p].id) index = pro;
		}
		processQueue[p].burst_time--;
		if (processQueue[p].burst_time === 0) {
			completionTime[processQueue[p].id] = time;
			readyQueue.splice(index, 1);
		}
		processQueue.splice(0, processQueue.length);
	}
	$(".btn").removeAttr("disabled");
	stop_flag = false;
	for (p in processes) {
		turnAroundPriorityPre[processes[p].id] =
			completionTime[processes[p].id] - processes[p].arrival_time;
		waitingPriorityPre[processes[p].id] =
			turnAroundPriorityPre[processes[p].id] - processes[p].burst_time;
	}
	completionTimePriorityPre = time;
	if (ganttPriorityPre.length > 0)
		ganttPriorityPre[ganttPriorityPre.length - 1].endTime = time;
	avgTurnaroundTimePriorityPre = calculateAvgTime(turnAroundPriorityPre);
	avgWaitingTimePriorityPre = calculateAvgTime(waitingPriorityPre);
	avgResponseTimePriorityPre = calculateAvgTime(responsePriorityPre);
}
var avgWaitingTimeRoundRobin = 0,
	avgTurnaroundTimeRoundRobin = 0,
	avgResponseTimeRoundRobin = 0;

var ganttRoundRobin = [];
var completionTimeRoundRobin = 0;

async function roundRobin(flag1) {
	readyQueueInit();
	let timeQuanta = Number($("#time_quanta").val());
	if (timeQuanta == 0) timeQuanta = 2;
	let time = 0;
	let processQueue = [];
	let min, p, j, flag;
	let completionTime = [];
	let turnAroundRR = [];
	let responseRR = [];
	let waitingRR = [];
	let runningQueue = [];

	// getting the initial processes in to the process queue
	while (true) {
		if (readyQueue.length == 0) break;
		for (let process in readyQueue) {
			if (readyQueue[process].arrival_time <= time) {
				processQueue.push(readyQueue[process]);
			}
		}
		if (processQueue.length === 0) {
			if (
				ganttRoundRobin.length > 0 &&
				ganttRoundRobin[ganttRoundRobin.length - 1].processId != null
			) {
				ganttRoundRobin[ganttRoundRobin.length - 1].endTime = time;
				ganttRoundRobin.push({
					processId: null,
					startTime: time,
					endTime: time + 1,
				});
			} else if (ganttRoundRobin.length == 0) {
				ganttRoundRobin.push({
					processId: null,
					startTime: time,
					endTime: time + 1,
				});
			}
			time++;
			continue;
		}

		break;
	}
	//then one by one all the processes
	outer: while (processQueue.length != 0) {
		prev_time = time;
		let currentProcess = processQueue[0];

		if (
			currentProcess.burst_time === getProcessById(currentProcess.id).burst_time
		) {
			//It means came for the first time
			responseRR[currentProcess.id] = prev_time - currentProcess.arrival_time;
		}

		if (currentProcess.burst_time > timeQuanta) {
			currentProcess.burst_time -= timeQuanta;
			time += timeQuanta;
			flag = true;
		} else {
			flag = false;
			time += currentProcess.burst_time;
			completionTime[currentProcess.id] = time;
			for (let process in readyQueue) {
				if (readyQueue[process].id == currentProcess.id) {
					readyQueue.splice(process, 1);
					break;
				}
			}
		}

		if (ganttRoundRobin.length > 0)
			ganttRoundRobin[ganttRoundRobin.length - 1].endTime = prev_time;
		ganttRoundRobin.push({
			processId: currentProcess.id,
			startTime: prev_time,
			endTime: time,
		});
		//Taking remaining process and pushing them in running queue
		while (true) {
			if (readyQueue.length == 0) break;
			for (let process in readyQueue) {
				if (readyQueue[process].arrival_time <= time) {
					runningQueue.push(readyQueue[process]);
				}
			}
			if (runningQueue.length === 0) {
				if (
					ganttRoundRobin.length > 0 &&
					ganttRoundRobin[ganttRoundRobin.length - 1].processId != null
				) {
					ganttRoundRobin[ganttRoundRobin.length - 1].endTime = time;
					ganttRoundRobin.push({
						processId: null,
						startTime: time,
						endTime: time + 1,
					});
				} else if (ganttRoundRobin.length == 0) {
					ganttRoundRobin.push({
						processId: null,
						startTime: time,
						endTime: time + 1,
					});
				}
				time++;
				continue;
			}
			// now taking those processes from running queue to process queue which has minimum arrival time
			while (runningQueue.length != 0) {
				min = Number.MAX_VALUE;
				for (let process in runningQueue) {
					if (runningQueue[process].arrival_time < min) {
						min = runningQueue[process].arrival_time;
						j = process;
					}
				}
				if (!processQueue.includes(runningQueue[j])) {
					processQueue.push(runningQueue[j]);
				}
				runningQueue.splice(j, 1);
			}
			break;
		}
		if (flag == true) {
			processQueue.push(currentProcess);
		}
		processQueue.shift();
	}
	$(".btn").removeAttr("disabled");
	stop_flag = false;
	for (p in processes) {
		turnAroundRR[processes[p].id] =
			completionTime[processes[p].id] - processes[p].arrival_time;
		waitingRR[processes[p].id] =
			turnAroundRR[processes[p].id] - processes[p].burst_time;
	}
	completionTimeRoundRobin = time;
	avgTurnaroundTimeRoundRobin = calculateAvgTime(turnAroundRR);
	avgWaitingTimeRoundRobin = calculateAvgTime(waitingRR);
	avgResponseTimeRoundRobin = calculateAvgTime(responseRR);
}

function init() {
	avgWaitingTimeRoundRobin = 0;
	avgWaitingTimePriorityPre = 0;
	avgWaitingTimePriorityNonPre = 0;
	avgWaitingTimeSJFPre = 0;
	avgWaitingTimeSJFNonPre = 0;
	avgWaitingTimeLJFNonPre = 0;
	avgWaitingTimeFCFS = 0;

	avgTurnaroundTimeRoundRobin = 0;
	avgTurnaroundTimePriorityPre = 0;
	avgTurnaroundTimePriorityNonPre = 0;
	avgTurnaroundTimeSJFPre = 0;
	avgTurnaroundTimeSJFNonPre = 0;
	avgTurnaroundTimeFCFS = 0;

	avgResponseTimeRoundRobin = 0;
	avgResponseTimePriorityPre = 0;
	avgResponseTimePriorityNonPre = 0;
	avgResponseTimeSJFPre = 0;
	avgResponseTimeSJFNonPre = 0;
	avgResponseTimeFCFS = 0;

	ganttFCFS = [];
	ganttSJFNonPre = [];
	ganttSJFPre = [];
	ganttPriorityNonPre = [];
	ganttPriorityPre = [];
	ganttRoundRobin = [];
	bestAlgo = [];

	completionTimeFCFS = 0;
	completionTimeSJF = 0;
	completionTimeSJFPre = 0;
	completionTimePriority = 0;
	completionTimePriorityPre = 0;
	completionTimeRoundRobin = 0;

	$("#gantt_FCFS").empty();
	$("#gantt_SJFNonPre").empty();
	$("#gantt_SJFPre").empty();
	$("#gantt_PriorityNonPre").empty();
	$("#gantt_PriorityPre").empty();
	$("#gantt_RoundRobin").empty();

	$("#final_result").empty();
}

function displayGanttChart() {
	for (i in ganttFCFS) {
		let diff = ganttFCFS[i].endTime - ganttFCFS[i].startTime + 80;
		if (ganttFCFS[i].processId != null)
			$("#gantt_FCFS").append(
				`<div class="gantt-box" style="width: ${diff}px"><span class="gantt-box-left">${ganttFCFS[i].startTime}</span>P${ganttFCFS[i].processId}<span class="gantt-box-right">${ganttFCFS[i].endTime}<span></div>`
			);
		else
			$("#gantt_FCFS").append(
				`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttFCFS[i].startTime}</span><span class="gantt-box-right">${ganttFCFS[i].endTime}<span></div>`
			);
	}
	for (i in ganttSJFNonPre) {
		let diff = ganttSJFNonPre[i].endTime - ganttSJFNonPre[i].startTime + 80;
		if (ganttSJFNonPre[i].processId != null)
			$("#gantt_SJFNonPre").append(
				`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttSJFNonPre[i].startTime}</span>P${ganttSJFNonPre[i].processId}<span class="gantt-box-right">${ganttSJFNonPre[i].endTime}<span></div>`
			);
		else
			$("#gantt_SJFNonPre").append(
				`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttSJFNonPre[i].startTime}</span><span class="gantt-box-right">${ganttSJFNonPre[i].endTime}<span></div>`
			);
	}
	for (i in ganttSJFPre) {
		let diff = ganttSJFPre[i].endTime - ganttSJFPre[i].startTime + 80;
		if (ganttSJFPre[i].processId != null)
			$("#gantt_SJFPre").append(
				`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttSJFPre[i].startTime}</span>P${ganttSJFPre[i].processId}<span class="gantt-box-right">${ganttSJFPre[i].endTime}<span></div>`
			);
		else
			$("#gantt_SJFPre").append(
				`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttSJFPre[i].startTime}</span><span class="gantt-box-right">${ganttSJFPre[i].endTime}<span></div>`
			);
	}
	for (i in ganttPriorityNonPre) {
		let diff =
			ganttPriorityNonPre[i].endTime - ganttPriorityNonPre[i].startTime + 80;
		if (ganttPriorityNonPre[i].processId != null)
			$("#gantt_PriorityNonPre").append(
				`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttPriorityNonPre[i].startTime}</span>P${ganttPriorityNonPre[i].processId}<span class="gantt-box-right">${ganttPriorityNonPre[i].endTime}<span></div>`
			);
		else
			$("#gantt_PriorityNonPre").append(
				`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttPriorityNonPre[i].startTime}</span><span class="gantt-box-right">${ganttPriorityNonPre[i].endTime}<span></div>`
			);
	}
	for (i in ganttPriorityPre) {
		let diff = ganttPriorityPre[i].endTime - ganttPriorityPre[i].startTime + 80;
		if (ganttPriorityPre[i].processId != null)
			$("#gantt_PriorityPre").append(
				`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttPriorityPre[i].startTime}</span>P${ganttPriorityPre[i].processId}<span class="gantt-box-right">${ganttPriorityPre[i].endTime}<span></div>`
			);
		else
			$("#gantt_PriorityPre").append(
				`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttPriorityPre[i].startTime}</span><span class="gantt-box-right">${ganttPriorityPre[i].endTime}<span></div>`
			);
	}
	for (i in ganttRoundRobin) {
		let diff = ganttRoundRobin[i].endTime - ganttRoundRobin[i].startTime + 80;
		if (ganttRoundRobin[i].processId != null)
			$("#gantt_RoundRobin").append(
				`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttRoundRobin[i].startTime}</span>P${ganttRoundRobin[i].processId}<span class="gantt-box-right">${ganttRoundRobin[i].endTime}<span></div>`
			);
		else
			$("#gantt_RoundRobin").append(
				`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttRoundRobin[i].startTime}</span><span class="gantt-box-right">${ganttRoundRobin[i].endTime}<span></div>`
			);
	}
}
let bestAlgo = [];

function calculateRank(a, b) {
	let duplicate = [];
	let rank = [];
	currentRank = 0;
	for (i in a) {
		duplicate[i] = a[i];
	}
	if (b === 1) {
		duplicate.sort((a, b) => {
			return a - b;
		});
	} else {
		duplicate.sort((a, b) => {
			return b - a;
		});
	}
	let set = new Set(duplicate);
	set.forEach((values) => {
		currentRank++;
		for (i in a) {
			if (a[i] === values) {
				rank[i] = currentRank;
			}
		}
	});

	return rank;
}

function findBest(checked) {
	//calculate min wt
	// calculate min tat
	// cs is context switching
	let algorithms = [
		"FCFS",
		"SJF",
		"SJF(Preemptive)",

		"Priority",
		"Priority(Preemptive)",
		"Round Robin",
	];
	let wt = [
		avgWaitingTimeFCFS,
		avgWaitingTimeSJFNonPre,
		avgWaitingTimeSJFPre,
		avgWaitingTimePriorityNonPre,
		avgWaitingTimePriorityPre,
		avgWaitingTimeRoundRobin,
	];
	let tat = [
		avgTurnaroundTimeFCFS,
		avgTurnaroundTimeSJFNonPre,
		avgTurnaroundTimeSJFPre,
		avgTurnaroundTimePriorityNonPre,
		avgTurnaroundTimePriorityPre,
		avgTurnaroundTimeRoundRobin,
	];
	let rt = [
		avgResponseTimeFCFS,
		avgResponseTimeSJFNonPre,
		avgResponseTimeSJFPre,
		avgResponseTimePriorityNonPre,
		avgResponseTimePriorityPre,
		avgResponseTimeRoundRobin,
	];
	let ct = [
		completionTimeFCFS,
		completionTimeSJF,
		completionTimeSJFPre,
		completionTimePriority,
		completionTimePriorityPre,
		completionTimeRoundRobin,
	];
	let cs = [
		ganttFCFS.length - 1,
		ganttSJFNonPre.length - 1,
		ganttSJFPre.length - 1,
		ganttPriorityNonPre.length - 1,
		ganttPriorityPre.length - 1,
		ganttRoundRobin.length - 1,
	];
	debugger;
	let cpuUtil = [];
	let throughput = [];
	let minArrivalTime = Number.MAX_VALUE;
	for (p in processes) {
		if (processes[p].arrival_time < minArrivalTime)
			minArrivalTime = processes[p].arrival_time;
	}
	for (i in cs) {
		if (i != cs.length - 1) {
			cpuUtil.push(ct[i] / (ct[i] + cs[i]));
			throughput.push(processes.length / (ct[i] + cs[i] - minArrivalTime));
		} else {
			cpuUtil.push(ct[i] / (ct[i] + cs[i]));
			throughput.push(processes.length / (ct[i] + cs[i]));
		}
	}
	let wtRank = [];
	let tatRank = [];
	let rtRank = [];
	let rank = [];
	throughputRank = calculateRank(throughput, 0);
	cpuUtilRank = calculateRank(cpuUtil, 0);
	wtRank = calculateRank(wt, 1);
	tatRank = calculateRank(tat, 1);
	rtRank = calculateRank(rt, 1);

	let minRank = Number.MAX_VALUE;
	for (a in algorithms) {
		if (checked[a]) {
			rank[a] =
				(wtRank[a] +
					tatRank[a] +
					cpuUtilRank[a] +
					throughputRank[a] +
					rtRank[a]) /
				3;
			if (rank[a] < minRank) minRank = rank[a];
		}
	}
	for (a in algorithms) {
		if (checked[a] && rank[a] === minRank) {
			bestAlgo.push({
				algorithm: algorithms[a],

				tat: tat[a].toFixed(2),
				wt: wt[a].toFixed(2),
				rt: rt[a].toFixed(2),
			});
		}
	}
}
