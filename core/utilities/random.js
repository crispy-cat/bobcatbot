module.exports = function(min, max, int = true) {
	var f = Math.random() * (max - min) + min;
	return (int === true) ? Math.round(f) : f;
}