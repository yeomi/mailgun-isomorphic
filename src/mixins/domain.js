export default (superclass) => class extends superclass {
  domains() {
    let self = this
    return {
      list() {
        return self.get('/domains')
          .then(response => response.items)
      }


    }
  }
};