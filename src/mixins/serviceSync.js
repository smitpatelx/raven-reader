import feedbin from '../services/feedbin'
import inoreader from '../services/inoreader'
import greader from '../services/greader'
import dayjs from 'dayjs'

export default {
  methods: {
    syncGreader () {
      if (this.$store.state.Setting.selfhost_connected) {
        greader.getEntries(this.$store.state.Setting.selfhost, dayjs(this.$store.state.Setting.greader_fetched_lastime).subtract(8, 'hour').unix()).then((res) => {
          window.log.info('Processing Greader feeds')
          greader.syncItems(this.$store.state.Setting.selfhost, res).then(() => {
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
          })
        })
      }
    },
    syncInoreader () {
      if (this.$store.state.Setting.inoreader_connected) {
        inoreader.getEntries(this.$store.state.Setting.inoreader, dayjs(this.$store.state.Setting.inoreader_last_fetched).subtract(8, 'hour').unix()).then((res) => {
          window.log.info('Processing Inoreader feeds')
          inoreader.syncItems(this.$store.state.Setting.inoreader, res).then(() => {
            this.$store.dispatch('loadCategories')
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
          })
        })
      }
    },
    syncFeedbin () {
      if (this.$store.state.Setting.feedbin_connected) {
        const promise = Promise.all([
          feedbin.getUnreadEntries(this.$store.state.Setting.feedbin),
          feedbin.getStarredEntries(this.$store.state.Setting.feedbin),
          feedbin.getEntries(this.$store.state.Setting.feedbin, dayjs(window.electronstore.getFeedbinLastFetched()).subtract(8, 'hour').toISOString())
        ])
        promise.then((res) => {
          const [unread, starred, entries] = res
          window.log.info('Processing Feedbin feeds')
          feedbin.syncItems(this.$store.state.Setting.feedbin, feedbin.transformEntriesAndFeed(unread, starred, entries)).then(() => {
            this.$store.dispatch('loadFeeds')
            this.$store.dispatch('loadArticles')
          })
        })
      }
    }
  }
}