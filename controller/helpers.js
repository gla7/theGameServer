function search (model, searchFields, req, res, next) {
  const orQuery = searchFields.map(field => {
    const regexQuery = {}
    regexQuery[field] = { $regex : new RegExp(req.body.text, 'i') }
    return regexQuery
  })
  model.find({ $or: orQuery }, (err, results) => {
    if (err) { return next(err) }
    res.send({ results })
  })
}

export default {
  search,
}
