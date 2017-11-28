export default function (req, res) {
	res.sendFile('/index.html', {root : "./public/"})
}
