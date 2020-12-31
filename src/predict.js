const Result = {
	0: "pileated",
	1: "red-bellied"
};
$("#image-selector").change(function () {
	let reader = new FileReader();
	reader.onload = function () {
		let dataURL = reader.result;
		$("#selected-image").attr("src", dataURL);
		$("#prediction-list").empty();
	}

	let file = $("#image-selector").prop('files')[0];
	reader.readAsDataURL(file);
});

let model;
$(document).ready(async function () {
	$('.progress-bar').show();
	model = await tf.loadGraphModel('model/model.json');
	$('.progress-bar').hide();
});

$("#predictBtn").click(async function () {
	let image = $('#selected-image').get(0);
	
	let pre_image = tf.browser.fromPixels(image, 3)
		.resizeNearestNeighbor([224, 224])
		.expandDims()
		.toFloat()
		.reverse(-1); 
	let predict_result = await model.predict(pre_image).data();
	console.log(predict_result);
	let order = Array.from(predict_result)
		.map(function (p, i) { 
			return {
				probability: p,
				className: Result[i] 
			};
		}).sort(function (a, b) {
			return b.probability - a.probability;
		}).slice(0, 2);

	$("#list").empty();
	order.forEach(function (p) {
		$("#list").append(`<li>${p.className}: ${parseInt(Math.trunc(p.probability * 100))} %</li>`);
	});
});