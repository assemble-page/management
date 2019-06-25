function renderInput (c, key, item, update) {
  return c('div', {}, [
    c('div', {}, item.label),
    c('el-input', {
      props: {
        value: item.value
      },
      on: {
        input: val => { update(key, val) }
      }
    })
  ])
}

function renderSelect (c, key, item, update) {
  return c('div', {}, [
    c('div', {}, item.label),
    c('el-select', {
      props: {
        value: item.value
      },
      on: {
        change: val => { update(key, val) }
      }
    }, item.options.map(x => c('el-option', {
      props: {
        label: x.label,
        value: x.value
      }
    })))
  ])
}

function renderColor (c, key, item, update) {
  return c('div', {}, [
    c('div', {}, item.label),
    c('el-color-picker', {
      props: {
        value: item.value,
        'show-alpha': true
      },
      on: {
        input: val => { update(key, val) }
      }
    })
  ])
}

function renderCheckbox (c, key, item, update) {
  return c('div', {}, [
    c('div', {}, item.label),
    c('el-checkbox', {
      props: {
        value: item.value
      },
      on: {
        input: val => { update(key, val) }
      }
    })
  ])
}

export default {
  functional: true,

  props: {
    schema: Object,
    updateProps: Function
  },

  render (c, context) {
    const { schema, updateProps } = context.props
    const update = (key, value) => { updateProps(key, { ...schema[key], value }) }
    const childs = Object.keys(schema).map(key => {
      switch (schema[key].type) {
        case 'input':
          return renderInput(c, key, schema[key], update)
        case 'select':
          return renderSelect(c, key, schema[key], update)
        case 'color':
          return renderColor(c, key, schema[key], update)
        case 'checkbox':
          return renderCheckbox(c, key, schema[key], update)
      }
    })
    return c('div', null, childs)
  }
}
